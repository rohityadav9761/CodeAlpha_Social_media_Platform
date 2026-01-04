const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  bio: { type: DataTypes.STRING }
});

const Post = sequelize.define('Post', {
  content: { type: DataTypes.TEXT, allowNull: false }
});

const Comment = sequelize.define('Comment', {
  content: { type: DataTypes.TEXT, allowNull: false }
});

const Like = sequelize.define('Like', {});

const Follow = sequelize.define('Follow', {});

// Relationships
User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Comment);
Comment.belongsTo(Post);
User.hasMany(Comment);
Comment.belongsTo(User);

Post.hasMany(Like);
Like.belongsTo(Post);
User.hasMany(Like);
Like.belongsTo(User);

User.belongsToMany(User, { as: 'Followers', through: Follow, foreignKey: 'followingId', otherKey: 'followerId' });
User.belongsToMany(User, { as: 'Following', through: Follow, foreignKey: 'followerId', otherKey: 'followingId' });

module.exports = { sequelize, User, Post, Comment, Like, Follow };
