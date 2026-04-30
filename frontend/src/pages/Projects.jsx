import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name, description });
      setShowModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Failed to create project (Admins only)');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(!showModal)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {showModal && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Create New Project</h3>
          <form onSubmit={handleCreate} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required rows="3"></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Save Project</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3">
        {projects.map(project => (
          <Link to={`/projects/${project._id}`} key={project._id} className="card" style={{ display: 'block', color: 'inherit' }}>
            <h3 className="card-title">{project.name}</h3>
            <p className="card-subtitle">{project.description}</p>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Created by: {project.owner?.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Projects;
