import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Create Task Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  
  // Edit Project State
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');

  // Edit Task State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('Medium');

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjectAndTasks();
    if (user.role === 'Admin') {
      fetchUsers();
    }
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`)
      ]);
      setProject(projRes.data);
      setEditProjectName(projRes.data.name);
      setEditProjectDesc(projRes.data.description);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Project Actions ---
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, { name: editProjectName, description: editProjectDesc });
      setIsEditingProject(false);
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  // --- Task Actions ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description,
        project: id,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate || undefined,
        priority
      });
      setShowTaskForm(false);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      setPriority('Medium');
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { title: editTaskTitle, description: editTaskDesc, priority: editTaskPriority });
      setEditingTaskId(null);
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (!project) return <div>Loading...</div>;

  const renderTaskColumn = (status) => {
    const columnTasks = tasks.filter(t => t.status === status);
    return (
      <div className="task-column">
        <div className="task-column-header">{status} ({columnTasks.length})</div>
        {columnTasks.map(task => (
          <div key={task._id} className="task-item">
            {editingTaskId === task._id ? (
              <div style={{ marginBottom: '1rem' }}>
                <input 
                  className="form-control" style={{ marginBottom: '0.5rem', padding: '0.5rem' }}
                  value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} 
                />
                <textarea 
                  className="form-control" style={{ marginBottom: '0.5rem', padding: '0.5rem' }} rows="2"
                  value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} 
                />
                <select className="form-control" style={{ marginBottom: '0.5rem', padding: '0.5rem' }} value={editTaskPriority} onChange={(e) => setEditTaskPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={() => handleUpdateTask(task._id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Save</button>
                  <button className="btn" onClick={() => setEditingTaskId(null)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ marginBottom: '0.5rem', flex: 1 }}>{task.title}</h4>
                  {user.role === 'Admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingTaskId(task._id); setEditTaskTitle(task.title); setEditTaskDesc(task.description || ''); setEditTaskPriority(task.priority || 'Medium'); }} style={{ background: 'none', color: 'var(--text-muted)' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {task.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{task.description}</p>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Assignee: {task.assignedTo?.name || 'Unassigned'} <br/>
                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'} <br/>
                  Priority: <span style={{ fontWeight: 'bold' }}>{task.priority || 'Medium'}</span>
                </div>
              </>
            )}
            
            {(user.role === 'Admin' || task.assignedTo?._id === user._id) && (
              <select 
                className="form-control" 
                style={{ padding: '0.25rem', fontSize: '0.875rem' }}
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ flex: 1 }}>
          {isEditingProject ? (
            <form onSubmit={handleUpdateProject} style={{ maxWidth: '400px' }}>
              <input 
                className="form-control" style={{ marginBottom: '0.5rem' }}
                value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} required
              />
              <textarea 
                className="form-control" style={{ marginBottom: '0.5rem' }} rows="2"
                value={editProjectDesc} onChange={(e) => setEditProjectDesc(e.target.value)} required
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                <button type="button" className="btn" onClick={() => setIsEditingProject(false)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h1>{project.name}</h1>
              <p className="card-subtitle">{project.description}</p>
            </>
          )}
        </div>
        
        {user?.role === 'Admin' && !isEditingProject && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" onClick={() => setIsEditingProject(true)}>
              <Edit size={18} /> Edit Project
            </button>
            <button className="btn btn-danger" onClick={handleDeleteProject}>
              <Trash2 size={18} /> Delete
            </button>
            <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
              <Plus size={18} /> Add Task
            </button>
          </div>
        )}
      </div>

      {showTaskForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Create New Task</h3>
          <form onSubmit={handleCreateTask} style={{ marginTop: '1rem' }}>
            <div className="grid grid-cols-3">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-control" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2" style={{ marginTop: '-1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows="2"></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </form>
        </div>
      )}

      <div className="task-board">
        {renderTaskColumn('Todo')}
        {renderTaskColumn('In Progress')}
        {renderTaskColumn('Done')}
      </div>
    </div>
  );
};

export default ProjectDetail;
