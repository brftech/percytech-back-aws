import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Platform, Company, Brand, Inbox, User, Person } from '../types/api';

export const Dashboard: React.FC = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all entities
        const [
          platformsData,
          companiesData,
          brandsData,
          inboxesData,
          usersData,
          personsData,
        ] = await Promise.all([
          apiClient.getPlatforms(),
          apiClient.getCompanies(),
          apiClient.getBrands(),
          apiClient.getInboxes(),
          apiClient.getUsers(),
          apiClient.getPersons(),
        ]);

        setPlatforms(platformsData);
        setCompanies(companiesData);
        setBrands(brandsData);
        setInboxes(inboxesData);
        setUsers(usersData);
        setPersons(personsData);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSeedPlatforms = async () => {
    try {
      await apiClient.seedPlatforms();
      // Refresh platforms
      const platformsData = await apiClient.getPlatforms();
      setPlatforms(platformsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed platforms');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '128px',
              height: '128px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          ></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #f87171',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '6px',
            }}
          >
            <strong style={{ fontWeight: 'bold' }}>Error:</strong>
            <span style={{ display: 'block' }}> {error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={e =>
              (e.currentTarget.style.backgroundColor = '#2563eb')
            }
            onMouseOut={e =>
              (e.currentTarget.style.backgroundColor = '#3b82f6')
            }
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '8px',
            }}
          >
            PercyTech Modern Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>
            Testing the complete backend system with {platforms.length}{' '}
            platforms, {companies.length} companies, {brands.length} brands,{' '}
            {inboxes.length} inboxes, {users.length} users, and {persons.length}{' '}
            persons.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
          <button
            onClick={handleSeedPlatforms}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseOver={e =>
              (e.currentTarget.style.backgroundColor = '#059669')
            }
            onMouseOut={e =>
              (e.currentTarget.style.backgroundColor = '#10b981')
            }
          >
            Seed Platforms
          </button>
        </div>

        {/* Entity Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Platforms */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  marginRight: '8px',
                }}
              ></span>
              Platforms ({platforms.length})
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {platforms.map(platform => (
                <div
                  key={platform.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {platform.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Type: {platform.type} | Status: {platform.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Companies */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  marginRight: '8px',
                }}
              ></span>
              Companies ({companies.length})
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {companies.map(company => (
                <div
                  key={company.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {company.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Status: {company.status} | TCR:{' '}
                    {company.tcrVerified ? 'Verified' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '50%',
                  marginRight: '8px',
                }}
              ></span>
              Brands ({brands.length})
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {brands.map(brand => (
                <div
                  key={brand.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {brand.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Type: {brand.businessType} | Status: {brand.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inboxes */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#eab308',
                  borderRadius: '50%',
                  marginRight: '8px',
                }}
              ></span>
              Inboxes ({inboxes.length})
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {inboxes.map(inbox => (
                <div
                  key={inbox.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {inbox.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Status: {inbox.status} | Area: {inbox.areaCode || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  marginRight: '8px',
                }}
              ></span>
              Users ({users.length})
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {users.map(user => (
                <div
                  key={user.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Status: {user.status} | Login: {user.preferredLoginMethod}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Persons */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#6366f1',
                  borderRadius: '50%',
                  marginRight: '8px',
                }}
              ></span>
              Persons ({persons.length})
            </h2>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {persons.map(person => (
                <div
                  key={person.id}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {person.cell_phone}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Type: {person.type} | Status: {person.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div
          style={{
            marginTop: '32px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
            }}
          >
            System Status
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#10b981',
                }}
              >
                {platforms.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Platforms
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                }}
              >
                {companies.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Companies
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#8b5cf6',
                }}
              >
                {brands.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Brands</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#eab308',
                }}
              >
                {inboxes.length}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Inboxes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
