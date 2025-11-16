'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBlogs, createBlog, updateBlog, deleteBlog, Blog } from '@/lib/api';
import { getCareers, createCareer, updateCareer, deleteCareer, Career } from '@/lib/api';
import styles from '@/styles/AdminDashboard.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'blogs' | 'careers'>('blogs');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    is_published: true,
  });
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // Career form state
  const [careerForm, setCareerForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    benefits: '',
    salary_range: '',
    is_active: true,
  });
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin');
      return;
    }
    // Verify token is valid
    fetch(`${API_BASE_URL}/api/admin/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/admin');
        } else {
          loadData();
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin');
      });
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      
      // Load blogs
      const blogsResponse = await fetch(`${API_BASE_URL}/api/blogs/?skip=0&limit=100&published_only=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        setBlogs(blogsData);
      }

      // Load careers
      const careersResponse = await fetch(`${API_BASE_URL}/api/careers/?skip=0&limit=100&active_only=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (careersResponse.ok) {
        const careersData = await careersResponse.json();
        setCareers(careersData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin');
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      const blogData = {
        title: blogForm.title,
        content: blogForm.content,
        excerpt: blogForm.excerpt || undefined,
        category: blogForm.category || undefined,
        tags: blogForm.tags ? blogForm.tags.split(',').map(t => t.trim()) : undefined,
        is_published: blogForm.is_published,
      };

      if (editingBlog) {
        await updateBlog(editingBlog.id, blogData);
      } else {
        await createBlog(blogData);
      }

      setBlogForm({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        is_published: true,
      });
      setEditingBlog(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save blog');
    }
  };

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAdminToken();
      const careerData = {
        title: careerForm.title,
        department: careerForm.department,
        location: careerForm.location,
        type: careerForm.type,
        description: careerForm.description,
        requirements: careerForm.requirements ? careerForm.requirements.split('\n').filter(r => r.trim()) : undefined,
        benefits: careerForm.benefits ? careerForm.benefits.split('\n').filter(b => b.trim()) : undefined,
        salary_range: careerForm.salary_range || undefined,
        is_active: careerForm.is_active,
      };

      if (editingCareer) {
        await updateCareer(editingCareer.id, careerData);
      } else {
        await createCareer(careerData);
      }

      setCareerForm({
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        description: '',
        requirements: '',
        benefits: '',
        salary_range: '',
        is_active: true,
      });
      setEditingCareer(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save career');
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteBlog(id);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete blog');
    }
  };

  const handleDeleteCareer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career opening?')) return;
    try {
      await deleteCareer(id);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete career');
    }
  };

  if (loading && blogs.length === 0 && careers.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'blogs' ? styles.active : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          Blogs
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'careers' ? styles.active : ''}`}
          onClick={() => setActiveTab('careers')}
        >
          Careers
        </button>
      </div>

      {activeTab === 'blogs' && (
        <div className={styles.content}>
          <div className={styles.formSection}>
            <h2>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</h2>
            <form onSubmit={handleBlogSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Title"
                value={blogForm.title}
                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                className={styles.input}
                required
              />
              <textarea
                placeholder="Content"
                value={blogForm.content}
                onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                className={styles.textarea}
                rows={10}
                required
              />
              <input
                type="text"
                placeholder="Excerpt (optional)"
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Category (optional)"
                value={blogForm.category}
                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Tags (comma-separated, optional)"
                value={blogForm.tags}
                onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                className={styles.input}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={blogForm.is_published}
                  onChange={(e) => setBlogForm({ ...blogForm, is_published: e.target.checked })}
                />
                Published
              </label>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {editingBlog ? 'Update' : 'Create'} Blog
                </button>
                {editingBlog && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlog(null);
                      setBlogForm({
                        title: '',
                        content: '',
                        excerpt: '',
                        category: '',
                        tags: '',
                        is_published: true,
                      });
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={styles.listSection}>
            <h2>Existing Blogs ({blogs.length})</h2>
            <div className={styles.list}>
              {blogs.map((blog) => (
                <div key={blog.id} className={styles.listItem}>
                  <div className={styles.listItemContent}>
                    <h3>{blog.title}</h3>
                    <p className={styles.meta}>
                      {blog.category && <span className={styles.badge}>{blog.category}</span>}
                      {blog.is_published ? (
                        <span className={styles.statusPublished}>Published</span>
                      ) : (
                        <span className={styles.statusDraft}>Draft</span>
                      )}
                    </p>
                  </div>
                  <div className={styles.listItemActions}>
                    <button
                      onClick={() => {
                        setEditingBlog(blog);
                        setBlogForm({
                          title: blog.title,
                          content: blog.content,
                          excerpt: blog.excerpt || '',
                          category: blog.category || '',
                          tags: blog.tags?.join(', ') || '',
                          is_published: blog.is_published,
                        });
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'careers' && (
        <div className={styles.content}>
          <div className={styles.formSection}>
            <h2>{editingCareer ? 'Edit Career' : 'Create New Career'}</h2>
            <form onSubmit={handleCareerSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Job Title"
                value={careerForm.title}
                onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })}
                className={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={careerForm.department}
                onChange={(e) => setCareerForm({ ...careerForm, department: e.target.value })}
                className={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={careerForm.location}
                onChange={(e) => setCareerForm({ ...careerForm, location: e.target.value })}
                className={styles.input}
                required
              />
              <select
                value={careerForm.type}
                onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })}
                className={styles.input}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <textarea
                placeholder="Description"
                value={careerForm.description}
                onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })}
                className={styles.textarea}
                rows={5}
                required
              />
              <textarea
                placeholder="Requirements (one per line)"
                value={careerForm.requirements}
                onChange={(e) => setCareerForm({ ...careerForm, requirements: e.target.value })}
                className={styles.textarea}
                rows={5}
              />
              <textarea
                placeholder="Benefits (one per line)"
                value={careerForm.benefits}
                onChange={(e) => setCareerForm({ ...careerForm, benefits: e.target.value })}
                className={styles.textarea}
                rows={5}
              />
              <input
                type="text"
                placeholder="Salary Range (optional)"
                value={careerForm.salary_range}
                onChange={(e) => setCareerForm({ ...careerForm, salary_range: e.target.value })}
                className={styles.input}
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={careerForm.is_active}
                  onChange={(e) => setCareerForm({ ...careerForm, is_active: e.target.checked })}
                />
                Active
              </label>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {editingCareer ? 'Update' : 'Create'} Career
                </button>
                {editingCareer && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCareer(null);
                      setCareerForm({
                        title: '',
                        department: '',
                        location: '',
                        type: 'Full-time',
                        description: '',
                        requirements: '',
                        benefits: '',
                        salary_range: '',
                        is_active: true,
                      });
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={styles.listSection}>
            <h2>Existing Careers ({careers.length})</h2>
            <div className={styles.list}>
              {careers.map((career) => (
                <div key={career.id} className={styles.listItem}>
                  <div className={styles.listItemContent}>
                    <h3>{career.title}</h3>
                    <p className={styles.meta}>
                      <span className={styles.badge}>{career.department}</span>
                      <span className={styles.badge}>{career.location}</span>
                      <span className={styles.badge}>{career.type}</span>
                      {career.is_active ? (
                        <span className={styles.statusPublished}>Active</span>
                      ) : (
                        <span className={styles.statusDraft}>Inactive</span>
                      )}
                    </p>
                  </div>
                  <div className={styles.listItemActions}>
                    <button
                      onClick={() => {
                        setEditingCareer(career);
                        setCareerForm({
                          title: career.title,
                          department: career.department,
                          location: career.location,
                          type: career.type,
                          description: career.description,
                          requirements: career.requirements?.join('\n') || '',
                          benefits: career.benefits?.join('\n') || '',
                          salary_range: career.salary_range || '',
                          is_active: career.is_active,
                        });
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCareer(career.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

