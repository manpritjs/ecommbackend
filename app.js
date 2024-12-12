const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const cors = require("cors");
const verifyToken = require('./middleware/verifyToken'); // Token verification middleware
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/onlineshop')
  .then(async () => {
    console.log('MongoDB connected');
    // Check if admin already exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      // Create admin user if it doesn't exist
      const adminPassword = await bcrypt.hash('adminPassword', 10);
      await User.create({
        name: 'admin',
        password: adminPassword,
        role: 'admin',
        mob:"9988867876",
        email: "admin@gmail.com",
        address:"Ludhiana"
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  })
  .catch(err => console.error(err));

// Registration route
app.post('/register', async (req, res) => {
  const { name, email, password, mob, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    mob,
    address,
    password: hashedPassword,
  });
  await user.save();
  res.status(201).send('User registered successfully');
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('User not found');
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).send('Invalid password');
  }
  const token = jwt.sign({ userId: user._id },  '111222');
  res.json({
    token,
    user: {
      name: user.name,
      email: user.email,
    },
  });
});


// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
