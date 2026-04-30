const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all tasks
// @route   GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.query.projectId) {
      query.project = req.query.projectId;
    }
    // If not admin, they might only see their tasks or all tasks in a project. Let's allow everyone to see all tasks if they have access.
    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a task
// @route   POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    // Only admins should create tasks? Or maybe project members too. Let's allow anyone for simplicity or strictly admins.
    // The requirement says "Role-based access control (Admin/Member)", Admins usually create/assign.
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to create tasks' });
    }

    const { title, description, project, assignedTo, dueDate, priority } = req.body;
    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      dueDate,
      priority: priority || 'Medium',
      status: 'Todo'
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a task status
// @route   PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      // Members can update status of tasks assigned to them, Admin can update anything.
      if (req.user.role === 'Admin' || (task.assignedTo && task.assignedTo.toString() === req.user._id.toString())) {
        task.status = req.body.status || task.status;
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.assignedTo = req.body.assignedTo || task.assignedTo;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.priority = req.body.priority || task.priority;

        const updatedTask = await task.save();
        res.json(updatedTask);
      } else {
        res.status(403).json({ message: 'Not authorized to update this task' });
      }
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      if (req.user.role === 'Admin') {
        await task.deleteOne();
        res.json({ message: 'Task removed' });
      } else {
        res.status(403).json({ message: 'Not authorized to delete tasks' });
      }
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
