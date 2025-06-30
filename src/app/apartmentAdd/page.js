'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line no-unused-vars
import Input from '../components/Input';
// eslint-disable-next-line no-unused-vars
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import ApiClient from '@/utils/apiClient';

export default function ApartmentAdd() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    latitude: '',
    longitude: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: '',
    images: [],
    status: '',
    isPublic: true,
    neighborhoodRating: 5,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const apiClient = new ApiClient();
    if (!apiClient.isLoggedIn()) {
      window.location.href = '/auth/unauthorized';
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (autocompleteValue.length >= 3) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              autocompleteValue
            )}&addressdetails=1`
          );
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error('Failed to fetch suggestions', err);
        }
      } else {
        setSuggestions([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [autocompleteValue]);

  const handleSuggestionClick = (place) => {
    setAutocompleteValue(place.display_name);
    setSuggestions([]);

    const lat = place.lat;
    const lon = place.lon;
    const address = place.address;

    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      street: [address.road, address.house_number].filter(Boolean).join(' '),
      city: address.city || address.town || address.village || '',
      state: address.state || address.state_district || address.region || address.province || '',
      zipCode: address.postcode || '',
      country: address.country || '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.price.trim()) newErrors.price = 'Price is required.';
    if (!formData.bedrooms.trim()) newErrors.bedrooms = 'Bedrooms are required.';
    if (!formData.bathrooms.trim()) newErrors.bathrooms = 'Bathrooms are required.';
    if (!formData.area.trim()) newErrors.area = 'Area is required.';
    if (
      !formData.amenities.trim() ||
      formData.amenities
        .trim()
        .split(',')
        .filter((item) => item.trim()).length === 0
    ) {
      newErrors.amenities = 'Amenities are required (enter at least one amenity).';
    }
    if (!formData.status.trim()) newErrors.status = 'Status is required.';
    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = 'Please enter a valid price.';
    }
    if (formData.bedrooms && (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) < 0)) {
      newErrors.bedrooms = 'Please enter a valid number of bedrooms.';
    }
    if (
      formData.bathrooms &&
      (isNaN(Number(formData.bathrooms)) || Number(formData.bathrooms) < 0)
    ) {
      newErrors.bathrooms = 'Please enter a valid number of bathrooms.';
    }
    if (formData.area && (isNaN(Number(formData.area)) || Number(formData.area) < 0)) {
      newErrors.area = 'Please enter a valid area.';
    }
    if (!formData.street.trim()) newErrors.street = 'Street is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    if (!formData.state.trim()) newErrors.state = 'State is required.';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip Code is required.';
    if (!formData.country.trim()) newErrors.country = 'Country is required.';
    if (!formData.latitude.trim()) newErrors.latitude = 'Latitude is required.';
    else if (isNaN(Number(formData.latitude))) newErrors.latitude = 'Latitude must be a number.';
    if (!formData.longitude.trim()) newErrors.longitude = 'Longitude is required.';
    else if (isNaN(Number(formData.longitude))) newErrors.longitude = 'Longitude must be a number.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', type: '' });
    // eslint-disable-next-line no-console
    console.log('Form submitted:', formData);
    if (!isLoggedIn) {
      setFeedback({ message: 'Please log in to add an apartment', type: 'error' });
      return;
    }
    if (imageFiles.length > 8) {
      setFeedback({ message: 'You can upload a maximum of 8 images.', type: 'error' });
      return;
    }
    setSuccess(false);
    if (validateForm()) {
      setLoading(true);
      try {
        const apiClient = new ApiClient();
        if (!apiClient.isLoggedIn()) {
          window.location.href = '/auth/unauthorized';
          return;
        }
        const locationObject = {
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        };
        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('description', formData.description);
        submissionData.append('price', formData.price);
        submissionData.append('bedrooms', formData.bedrooms);
        submissionData.append('bathrooms', formData.bathrooms);
        submissionData.append('area', formData.area);
        submissionData.append('amenities', formData.amenities);
        submissionData.append('status', formData.status);
        submissionData.append('isPublic', 'true');
        submissionData.append('neighborhoodRating', formData.neighborhoodRating);
        submissionData.append('location', JSON.stringify(locationObject));
        if (imageFiles.length > 0) {
          imageFiles.forEach((file) => submissionData.append('images', file));
        }
        // Debug: Log what's being sent
        console.log('Form data being sent:', { ...formData });
        // eslint-disable-next-line no-console
        console.log('Uploading apartment data...');
        const response = await apiClient.createApartment(submissionData);
        // eslint-disable-next-line no-console
        console.log('Upload response:', response.data);
        if (
          response.data &&
          (response.status === 200 || response.status === 201) &&
          !response.data.error
        ) {
          setFeedback({ message: 'Apartment added successfully!', type: 'success' });
          // Reset form
          setFormData({
            title: '',
            description: '',
            price: '',
            latitude: '',
            longitude: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            bedrooms: '',
            bathrooms: '',
            area: '',
            amenities: '',
            images: [],
            status: '',
            isPublic: true,
            neighborhoodRating: 5,
          });
          setAutocompleteValue('');
          setSuggestions([]);
          setImageFiles([]);
          setImages([]);
          setTimeout(() => router.push('/listings'), 1500);
        } else {
          setFeedback({
            message: response.data?.error || 'Error uploading apartment. Please try again.',
            type: 'error',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error uploading apartment:', error);
        setFeedback({
          message: error?.response?.data?.error || 'Error uploading apartment. Please try again.',
          type: 'error',
        });
      }
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // eslint-disable-next-line no-console
    console.log('Input change:', name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // eslint-disable-next-line no-console
    console.log('Selected files:', files);

    setImageFiles(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages(previews);
  };
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">List An Apartment</h1>
      {/* Feedback message */}
      {feedback.message && (
        <div
          className={`mb-4 p-3 rounded text-center ${
            feedback.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a title"
            required
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        <div>
          <Input
            label="Description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter a description"
            required
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>
        <div>
          <Input
            label="Price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter a price"
            required
          />
          {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="autocomplete" className="block mb-1 font-semibold">
            Search Address
          </label>
          <input
            id="autocomplete"
            type="text"
            value={autocompleteValue}
            onChange={(e) => setAutocompleteValue(e.target.value)}
            placeholder="Start typing address..."
            className="w-full p-2 border rounded"
          />
          {suggestions.length > 0 && (
            <ul className="border mt-1 max-h-60 overflow-y-auto rounded shadow bg-white z-10 relative">
              {suggestions.map((sugg, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(sugg)}
                >
                  {sugg.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <Input
            label="Street"
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            placeholder="Enter street"
            required
          />
          {errors.street && <p className="mt-1 text-sm text-red-500">{errors.street}</p>}
        </div>
        <div>
          <Input
            label="City"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            required
          />
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>
        <div>
          <Input
            label="State"
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state"
            required
          />
          {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
        </div>
        <div>
          <Input
            label="Zip Code"
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            placeholder="Enter zip code"
            required
          />
          {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>}
        </div>
        <div>
          <Input
            label="Country"
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Enter country"
            required
          />
          {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
        </div>

        <div>
          <Input
            label="Bedrooms"
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            placeholder="Enter number of bedrooms"
            required
          />
          {errors.bedrooms && <p className="mt-1 text-sm text-red-500">{errors.bedrooms}</p>}
        </div>
        <div>
          <Input
            label="Bathrooms"
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            placeholder="Enter number of bathrooms"
            required
          />
          {errors.bathrooms && <p className="mt-1 text-sm text-red-500">{errors.bathrooms}</p>}
        </div>
        <div>
          <Input
            label="Area"
            type="number"
            name="area"
            value={formData.area}
            onChange={handleInputChange}
            placeholder="Enter an area"
            required
          />
          {errors.area && <p className="mt-1 text-sm text-red-500">{errors.area}</p>}
        </div>
        <div>
          <Input
            label="Amenities (comma separated)"
            type="text"
            name="amenities"
            value={formData.amenities}
            onChange={handleInputChange}
            placeholder="Enter the amenities"
            required
          />
          {errors.amenities && <p className="mt-1 text-sm text-red-500">{errors.amenities}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Images (up to 8)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
        </div>
        <div>
          <Input
            label="Status"
            type="text"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            placeholder="Enter status (available, rented, pending)"
            required
          />
          {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
        </div>

        {/* Neighborhood Rating */}
        <div>
          <label className="block mb-1 font-semibold">Neighborhood Rating (1-10)</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.neighborhoodRating}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, neighborhoodRating: parseInt(e.target.value) }))
              }
              className="flex-1"
            />
            <span className="text-lg font-semibold w-8 text-center">
              {formData.neighborhoodRating}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {success && (
          <p style={{ color: 'green', marginTop: '1rem' }}>Apartment listed successfully!</p>
        )}
        <Button type="submit">{loading ? 'Listing apartment...' : 'List an apartment'}</Button>
      </form>
    </div>
  );
}
