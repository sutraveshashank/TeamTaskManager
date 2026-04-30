import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, AlertTriangle, BarChart2, Users } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
    if (user.role === 'Admin') {
      fetchUsers();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      // For dashboard, Admin sees all tasks. Member sees their tasks.
      const displayTasks = res.data.filter(t => t.assignedTo?._id === user._id || user.role === 'Admin');
      setTasks(displayTasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks(); // Refresh tasks after update
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const todo = tasks.filter(t => t.status === 'Todo');
  const inProgress = tasks.filter(t => t.status === 'In Progress');
  const done = tasks.filter(t => t.status === 'Done');

  const isOverdue = (date) => new Date(date) < new Date() && date !== null;
  const overdueTasks = tasks.filter(t => t.status !== 'Done' && isOverdue(t.dueDate));

  // Compute tasks per user for Admin
  const tasksPerUser = allUsers.map(u => ({
    name: u.name,
    taskCount: tasks.filter(t => t.assignedTo?._id === u._id).length
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart2 size={24} color="var(--primary-color)" />
            <h3 className="card-title" style={{ margin: 0 }}>Total Tasks</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{tasks.length}</div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={24} color="var(--danger)" />
            <h3 className="card-title" style={{ margin: 0 }}>Overdue Tasks</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{overdueTasks.length}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3">
        <div className="card" style={{ borderTop: '4px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={20} color="var(--text-muted)" />
            <h3 className="card-title" style={{ margin: 0 }}>To Do</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{todo.length}</div>
        </div>
        
        <div className="card" style={{ borderTop: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock size={20} color="var(--warning)" />
            <h3 className="card-title" style={{ margin: 0 }}>In Progress</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{inProgress.length}</div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle size={20} color="var(--success)" />
            <h3 className="card-title" style={{ margin: 0 }}>Done</h3>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{done.length}</div>
        </div>
      </div>

      {user.role === 'Admin' && (
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Users size={24} />
            <h2 style={{ margin: 0 }}>Tasks per User</h2>
          </div>
          <div className="grid grid-cols-3">
            {tasksPerUser.map(item => (
              <div key={item.name} className="card">
                <h4 style={{ marginBottom: '0.5rem' }}>{item.name}</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.taskCount} tasks</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h2>{user.role === 'Admin' ? 'All Tasks Overview' : 'My Tasks'}</h2>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No tasks available.</p>
        ) : (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(task => (
              <div key={task._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ marginBottom: '0.25rem' }}>{task.title}</h4>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Project: {task.project?.name} | Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    {isOverdue(task.dueDate) && task.status !== 'Done' && <span style={{ color: 'var(--danger)', marginLeft: '0.5rem', fontWeight: 'bold' }}>(Overdue)</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {(user.role === 'Admin' || task.assignedTo?._id === user._id) ? (
                    <select 
                      className="form-control" 
                      style={{ padding: '0.25rem', fontSize: '0.875rem', width: 'auto' }}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  ) : (
                    <div className={`badge badge-${task.status.replace(' ', '-').toLowerCase()}`}>
                      {task.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
