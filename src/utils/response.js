const formatNote = (note) => ({
  id: note._id.toString(),
  title: note.title,
  content: note.content,
  isPinned: note.isPinned,
  tags: note.tags,
  created_at: note.createdAt,
  updated_at: note.updatedAt,
});

module.exports = { formatNote };
