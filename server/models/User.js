const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      name: { type: String, default: '' },
      bio: { type: String, default: '' },
      avatar: { type: String, default: '' },
      location: { type: String, default: '' },
      title: { type: String, default: '' },
      resume: { type: String, default: '' },
      careerVision: {
        role: { type: String, default: '' },
        growingInto: { type: String, default: '' },
        inspiredBy: { type: String, default: '' },
      },
      education: [
        {
          degree: { type: String, default: '' },
          institution: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
        },
      ],
      experience: [
        {
          role: { type: String, default: '' },
          company: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
          description: { type: String, default: '' },
        },
      ],
      certifications: [
        {
          title: { type: String, default: '' },
          issuer: { type: String, default: '' },
          date: { type: String, default: '' },
        },
      ],
      skills: { type: [String], default: [] },
      socials: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
