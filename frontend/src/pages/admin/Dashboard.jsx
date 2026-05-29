import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFileText, FiGrid, FiFolder, FiMessageSquare,
  FiDollarSign, FiHelpCircle, FiEye
} from 'react-icons/fi';
import Loading from '../../components/common/Loading';
import { pagesAPI, servicesAPI, projectsAPI, contactAPI, quotationsAPI, faqAPI } from '../../api/endpoints';
import { formatDate } from '../../utils/helpers';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pagesAPI.getAll().catch(() => ({ data: [] })),
      servicesAPI.getAll().catch(() => ({ data: [] })),
      projectsAPI.getAll().catch(() => ({ data: [] })),
      contactAPI.getSubmissions().catch(() => ({ data: [] })),
      quotationsAPI.getAll().catch(() => ({ data: [] })),
      faqAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([pages, services, projects, submissions, quotations, faqs]) => {
      setStats({
        pages: pages.data?.length || 0,
        services: services.data?.length || 0,
        projects: projects.data?.length || 0,
        submissions: submissions.data?.length || 0,
        quotations: quotations.data?.length || 0,
        faqs: faqs.data?.length || 0,
      });
      setRecentSubmissions((submissions.data || []).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const statCards = [
    { label: 'Pages', value: stats?.pages || 0, icon: FiFileText, color: 'blue', to: '/admin/pages' },
    { label: 'Services', value: stats?.services || 0, icon: FiGrid, color: 'green', to: '/admin/services' },
    { label: 'Projects', value: stats?.projects || 0, icon: FiFolder, color: 'purple', to: '/admin/projects' },
    { label: 'Submissions', value: stats?.submissions || 0, icon: FiMessageSquare, color: 'amber', to: '/admin/contact' },
    { label: 'Quotations', value: stats?.quotations || 0, icon: FiDollarSign, color: 'red', to: '/admin/quotations' },
    { label: 'FAQs', value: stats?.faqs || 0, icon: FiHelpCircle, color: 'blue', to: '/admin/faq' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {statCards.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className={`stat-icon ${color}`}><Icon /></div>
              <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Recent Contact Submissions</h3>
          <Link to="/admin/contact" className="btn btn-sm btn-outline">View All</Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <p style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: 20 }}>
            No submissions yet.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600 }}>{sub.name}</td>
                    <td>{sub.email}</td>
                    <td>{sub.subject || '-'}</td>
                    <td>{formatDate(sub.created_at)}</td>
                    <td>
                      <span className={`badge ${sub.is_read ? 'badge-success' : 'badge-warning'}`}>
                        {sub.is_read ? 'Read' : 'New'}
                      </span>
                    </td>
                    <td>
                      <Link to="/admin/contact" className="actions">
                        <button className="view"><FiEye /></button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
