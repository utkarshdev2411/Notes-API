const { Router } = require('express');
const openApiSpec = require('../openapi.json');

const router = Router();

router.get('/about', (req, res) => {
  return res.status(200).json({
    name: 'Utkarsh',
    email: 'utkarshdev2411@gmail.com',
    my_features: {
      'Note Pinning': 'Users can pin important notes so they always appear at the top of the list. Pinning is a core UX pattern in Apple Notes, Google Keep, and Notion — it solves the real problem of surfacing frequently accessed notes without manual sorting.',
      'Soft Delete': 'Notes are never permanently removed on delete. A deletedAt timestamp is set and the note becomes invisible to all queries via a Mongoose pre-find middleware. This preserves data integrity and enables future recovery features.',
      'Tags': 'Users can attach string tags to notes for lightweight personal categorization. This demonstrates schema extensibility and gives users an organizational layer without the complexity of folder hierarchies.',
    },
  });
});

router.get('/openapi.json', (req, res) => {
  return res.status(200).json(openApiSpec);
});

module.exports = router;
