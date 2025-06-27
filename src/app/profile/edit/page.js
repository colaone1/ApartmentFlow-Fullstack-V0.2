'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
// eslint-disable-next-line no-unused-vars
import Input from '@/app/components/Input';
// eslint-disable-next-line no-unused-vars
import Button from '@/app/components/Button';
import ApiClient from '@/utils/apiClient';
import { uploadImageToCloudinary } from '@/app/utils/cloudinary';

const edit = () => {
  const { user, setUser } = useAuth();
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: '',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const apiClient = new ApiClient();

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        password: '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
      setEditedUser({
        ...editedUser,
        profileImage: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fieldsToUpdate = {};
      if (editedUser.name) fieldsToUpdate.name = editedUser.name;
      if (editedUser.email) fieldsToUpdate.email = editedUser.email;
      if (editedUser.password) fieldsToUpdate.password = editedUser.password;

      if (profileImageFile) {
        const uploadedUrl = await uploadImageToCloudinary(profileImageFile);
        fieldsToUpdate.profileImage = uploadedUrl;
      } else if (editedUser.profileImage) {
        fieldsToUpdate.profileImage = editedUser.profileImage;
      }

      if (Object.keys(fieldsToUpdate).length === 0) {
        throw new Error('Please update at least one field.');
      }

      const response = await apiClient.updateProfile(fieldsToUpdate);
      setUser(response);
      setSuccess('Profile updated successfully!');
      setProfileImageFile(null);
      setEditedUser((prev) => ({ ...prev, password: '' }));
    } catch (error) {
      setError(error.message || 'Failed to update user profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-[var(--color-primary)]">
        Edit your profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            type="text"
            name="name"
            value={editedUser.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            name="email"
            value={editedUser.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <Input
            type="password"
            name="password"
            value={editedUser.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Profile Image</label>
          {editedUser.profileImage && (
            <img
              src={editedUser.profileImage}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full mb-2 object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>
        {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
        {error && <p className="mb-4 text-red-500 text-sm text-center">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-[var(--color-secondary)] text-white py-2 px-4 rounded hover:bg-[var(--color-accent)]"
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </div>
  );
};

export default edit;
