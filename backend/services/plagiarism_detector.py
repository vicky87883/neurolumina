import asyncio
import logging
from typing import Dict, List, Tuple, Optional, Any
from difflib import SequenceMatcher
import re
from collections import Counter
import hashlib
from services.database import db_manager
from sqlalchemy import text

logger = logging.getLogger(__name__)

class PlagiarismDetector:
    """High-efficiency plagiarism detection service"""
    
    def __init__(self):
        self.min_similarity_threshold = 0.1  # 10% minimum similarity to report
        self.chunk_size = 100  # Words per chunk for comparison
        self.max_comparisons = 1000  # Limit comparisons for performance
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison"""
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove punctuation (optional, can keep for better accuracy)
        # text = re.sub(r'[^\w\s]', '', text)
        return text.strip()
    
    def _split_into_chunks(self, text: str, chunk_size: int = None) -> List[str]:
        """Split text into chunks for comparison"""
        if chunk_size is None:
            chunk_size = self.chunk_size
        
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        return chunks
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts using SequenceMatcher"""
        return SequenceMatcher(None, text1, text2).ratio()
    
    def _calculate_cosine_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        # Create word frequency vectors
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        # Get all unique words
        all_words = words1.union(words2)
        
        if not all_words:
            return 0.0
        
        # Create frequency vectors
        vec1 = [1 if word in words1 else 0 for word in all_words]
        vec2 = [1 if word in words2 else 0 for word in all_words]
        
        # Calculate dot product
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        
        # Calculate magnitudes
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        # Calculate cosine similarity
        return dot_product / (magnitude1 * magnitude2)
    
    def _calculate_jaccard_similarity(self, text1: str, text2: str) -> float:
        """Calculate Jaccard similarity (intersection over union)"""
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return 0.0
        
        return len(intersection) / len(union)
    
    def _calculate_combined_similarity(self, text1: str, text2: str) -> float:
        """Calculate combined similarity using multiple algorithms"""
        # Normalize texts
        norm1 = self._normalize_text(text1)
        norm2 = self._normalize_text(text2)
        
        # Calculate different similarity metrics
        sequence_similarity = self._calculate_similarity(norm1, norm2)
        cosine_sim = self._calculate_cosine_similarity(norm1, norm2)
        jaccard_sim = self._calculate_jaccard_similarity(norm1, norm2)
        
        # Weighted average (sequence matcher is most accurate for text)
        combined = (sequence_similarity * 0.5 + cosine_sim * 0.3 + jaccard_sim * 0.2)
        
        return combined
    
    async def _get_all_content_from_db(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all content from database for comparison"""
        try:
            async with db_manager.get_async_session() as session:
                # Get from scraped_content table
                query_scraped = text("""
                    SELECT id, url, title, content, scraped_at
                    FROM scraped_content
                    WHERE content IS NOT NULL AND content != ''
                    ORDER BY scraped_at DESC
                    LIMIT :limit
                """)
                
                result = await session.execute(
                    query_scraped, 
                    {"limit": limit or self.max_comparisons}
                )
                scraped_rows = result.fetchall()
                
                # Get from training_data table
                query_training = text("""
                    SELECT id, prompt, response, created_at
                    FROM training_data
                    WHERE (prompt IS NOT NULL AND prompt != '') OR (response IS NOT NULL AND response != '')
                    ORDER BY created_at DESC
                    LIMIT :limit
                """)
                
                result = await session.execute(
                    query_training,
                    {"limit": limit or self.max_comparisons}
                )
                training_rows = result.fetchall()
                
                # Combine results
                content_list = []
                
                # Add scraped content
                for row in scraped_rows:
                    if row[3]:  # content
                        content_list.append({
                            "id": row[0],
                            "source": "scraped_content",
                            "url": row[1],
                            "title": row[2],
                            "content": row[3],
                            "date": row[4]
                        })
                
                # Add training data
                for row in training_rows:
                    # Add prompt if exists
                    if row[1]:  # prompt
                        content_list.append({
                            "id": f"training_{row[0]}_prompt",
                            "source": "training_data",
                            "type": "prompt",
                            "content": row[1],
                            "date": row[3]
                        })
                    # Add response if exists
                    if row[2]:  # response
                        content_list.append({
                            "id": f"training_{row[0]}_response",
                            "source": "training_data",
                            "type": "response",
                            "content": row[2],
                            "date": row[3]
                        })
                
                return content_list
                
        except Exception as e:
            logger.error(f"Error fetching content from database: {str(e)}")
            return []
    
    async def check_plagiarism(
        self,
        text: str,
        min_similarity: float = 0.3,
        use_chunks: bool = True,
        max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Check text for plagiarism against database content
        
        Args:
            text: Text to check for plagiarism
            min_similarity: Minimum similarity threshold (0.0-1.0)
            use_chunks: Whether to use chunk-based comparison for long texts
            max_results: Maximum number of results to return
        
        Returns:
            Dictionary with plagiarism detection results
        """
        try:
            if not text or len(text.strip()) < 10:
                return {
                    "plagiarism_percentage": 0.0,
                    "is_plagiarized": False,
                    "matches": [],
                    "message": "Text too short for plagiarism detection"
                }
            
            logger.info(f"Checking plagiarism for text (length: {len(text)} characters)")
            
            # Normalize input text
            normalized_text = self._normalize_text(text)
            
            # Get all content from database
            db_content = await self._get_all_content_from_db()
            
            if not db_content:
                return {
                    "plagiarism_percentage": 0.0,
                    "is_plagiarized": False,
                    "matches": [],
                    "message": "No content in database for comparison"
                }
            
            logger.info(f"Comparing against {len(db_content)} content items")
            
            # Compare with each content item
            matches = []
            
            if use_chunks and len(normalized_text.split()) > self.chunk_size:
                # Use chunk-based comparison for long texts
                text_chunks = self._split_into_chunks(normalized_text)
                
                for db_item in db_content:
                    db_content_text = self._normalize_text(db_item.get("content", ""))
                    if not db_content_text:
                        continue
                    
                    db_chunks = self._split_into_chunks(db_content_text)
                    
                    # Compare each chunk
                    max_chunk_similarity = 0.0
                    best_matching_chunk = ""
                    
                    for text_chunk in text_chunks:
                        for db_chunk in db_chunks:
                            similarity = self._calculate_combined_similarity(text_chunk, db_chunk)
                            if similarity > max_chunk_similarity:
                                max_chunk_similarity = similarity
                                best_matching_chunk = db_chunk
                    
                    if max_chunk_similarity >= min_similarity:
                        matches.append({
                            "similarity": max_chunk_similarity,
                            "similarity_percentage": round(max_chunk_similarity * 100, 2),
                            "source_id": db_item.get("id"),
                            "source": db_item.get("source"),
                            "url": db_item.get("url"),
                            "title": db_item.get("title"),
                            "matching_text": best_matching_chunk[:200] + "..." if len(best_matching_chunk) > 200 else best_matching_chunk,
                            "date": db_item.get("date").isoformat() if db_item.get("date") else None
                        })
            else:
                # Direct comparison for shorter texts
                for db_item in db_content:
                    db_content_text = self._normalize_text(db_item.get("content", ""))
                    if not db_content_text:
                        continue
                    
                    similarity = self._calculate_combined_similarity(normalized_text, db_content_text)
                    
                    if similarity >= min_similarity:
                        matches.append({
                            "similarity": similarity,
                            "similarity_percentage": round(similarity * 100, 2),
                            "source_id": db_item.get("id"),
                            "source": db_item.get("source"),
                            "url": db_item.get("url"),
                            "title": db_item.get("title"),
                            "matching_text": db_content_text[:200] + "..." if len(db_content_text) > 200 else db_content_text,
                            "date": db_item.get("date").isoformat() if db_item.get("date") else None
                        })
            
            # Sort matches by similarity (highest first)
            matches.sort(key=lambda x: x["similarity"], reverse=True)
            
            # Limit results
            matches = matches[:max_results]
            
            # Calculate overall plagiarism percentage
            if matches:
                # Use highest similarity as plagiarism percentage
                plagiarism_percentage = matches[0]["similarity_percentage"]
                is_plagiarized = plagiarism_percentage >= (min_similarity * 100)
            else:
                plagiarism_percentage = 0.0
                is_plagiarized = False
            
            return {
                "plagiarism_percentage": round(plagiarism_percentage, 2),
                "is_plagiarized": is_plagiarized,
                "matches": matches,
                "total_comparisons": len(db_content),
                "matches_found": len(matches),
                "text_length": len(text),
                "min_similarity_threshold": min_similarity * 100
            }
            
        except Exception as e:
            logger.error(f"Error in plagiarism detection: {str(e)}", exc_info=True)
            raise Exception(f"Plagiarism detection error: {str(e)}")
    
    async def check_plagiarism_batch(
        self,
        texts: List[str],
        min_similarity: float = 0.3
    ) -> List[Dict[str, Any]]:
        """Check multiple texts for plagiarism"""
        results = []
        for text in texts:
            result = await self.check_plagiarism(text, min_similarity)
            results.append(result)
        return results

