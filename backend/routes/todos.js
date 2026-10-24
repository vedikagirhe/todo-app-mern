const express = require("express");
const mongoose = require("mongoose");
const Todo = require("../models/Todo");

const router = express.Router();

function validId(id) {
  return mongoose.isValidObjectId(id);
}

// GET /api/todos — list all tasks, newest first
router.get("/", async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json({ success: true, todos });
  } catch (error) {
    next(error);
  }
});

// POST /api/todos — create a task
router.post("/", async (req, res, next) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      return res.status(400).json({ success: false, message: "Please enter a task title." });
    }
    const todo = await Todo.create({ title });
    res.status(201).json({ success: true, todo });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/todos/:id — edit title and/or completion status
router.patch("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID." });
    }

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(req.body, "title")) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({ success: false, message: "Task title cannot be empty." });
      }
      updates.title = req.body.title.trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "completed")) {
      if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({ success: false, message: "completed must be true or false." });
      }
      updates.completed = req.body.completed;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid updates provided." });
    }

    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!todo) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, todo });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/todos/:id — delete a task
router.delete("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid task ID." });
    }
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
