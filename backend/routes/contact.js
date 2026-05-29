const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/contactController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Departments
router.get('/departments', ctrl.getDepartments);
router.post('/departments', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required')
], validate, ctrl.createDepartment);
router.put('/departments/:id', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required')
], validate, ctrl.updateDepartment);
router.delete('/departments/:id', auth, ctrl.deleteDepartment);

// Options (configurable selection fields)
router.get('/options', ctrl.getOptions);
router.post('/options', auth, [
  body('field_name').notEmpty().withMessage('Field name is required'),
  body('option_value').notEmpty().withMessage('Option value is required')
], validate, ctrl.createOption);
router.put('/options/:id', auth, [
  body('field_name').notEmpty().withMessage('Field name is required'),
  body('option_value').notEmpty().withMessage('Option value is required')
], validate, ctrl.updateOption);
router.delete('/options/:id', auth, ctrl.deleteOption);

// Submissions
router.get('/submissions', auth, ctrl.getSubmissions);
router.get('/submissions/:id', auth, ctrl.getSubmissionById);
router.delete('/submissions/:id', auth, ctrl.deleteSubmission);

// Public form submit
router.post('/submit', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').notEmpty().withMessage('Message is required')
], validate, ctrl.submitForm);

module.exports = router;
