'use client';
import { useState, useEffect } from 'react';
import { ApiClient } from '../../utils/apiClient';
import Input from '../components/Input';
import Button from '../components/Button';

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
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteValue, setAutocompleteValue] = useState('');

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
    console.log('Form submission triggered');
    setSuccess(false);
    if (validateForm()) {
      setLoading(true);
      try {
        const apiClient = new ApiClient();

        // Check if user is logged in
        if (!apiClient.isLoggedIn()) {
          window.location.href = '/auth/unauthorized';
          return;
        }

        // Construct the location object as expected by the backend
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

        // Create FormData for file upload
        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('description', formData.description);
        submissionData.append('price', formData.price);
        submissionData.append('bedrooms', formData.bedrooms);
        submissionData.append('bathrooms', formData.bathrooms);
        submissionData.append('area', formData.area);
        submissionData.append('amenities', formData.amenities);
        submissionData.append('status', formData.status);
        submissionData.append('location', JSON.stringify(locationObject));

        if (formData.images && formData.images.length > 0) {
          formData.images.forEach((img) => submissionData.append('images', img));
        }

        // Debug: Log what's being sent
        console.log('Form data being sent:', {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          area: formData.area,
          amenities: formData.amenities,
          status: formData.status,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
        });

        // Debug: Log the actual FormData entries
        console.log('FormData entries:');
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            console.log(`${key}: ${value}`);
          }
        });

        await apiClient.createApartment(submissionData);

        setSuccess(true);
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
        });
        setAutocompleteValue('');
        setSuggestions([]);
      } catch (error) {
        console.error('Error listing an apartment.', error.response || error);
        console.log('Full error object:', error);
        console.log('Error response data:', error.response?.data);
        console.log('Error response status:', error.response?.status);

        // Log the specific validation errors
        if (error.response?.data?.details) {
          console.log('Validation errors:', error.response.data.details);
        }
        if (error.response?.data?.errors) {
          console.log('Validation errors:', error.response.data.errors);
        }

        setErrors({
          submit:
            (error.response?.data?.details &&
              Array.isArray(error.response.data.details) &&
              error.response.data.details.join(', ')) ||
            (error.response?.data?.errors &&
              Array.isArray(error.response.data.errors) &&
              error.response.data.errors.join(', ')) ||
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Failed to list an apartment. Please try again.',
        });
      }
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      // Accept up to 8 images
      const selectedFiles = Array.from(files).slice(0, 8);
      setFormData((prev) => ({ ...prev, images: selectedFiles }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">List An Apartment</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            placeholder="Enter status (available, rented, pending)"
            required
          />
          {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
        </div>
        {success && (
          <p style={{ color: 'green', marginTop: '1rem' }}>Apartment listed successfully!</p>
        )}
        {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
        <Button type="submit">{loading ? 'Listing apartment...' : 'List an apartment'}</Button>
      </form>
    </div>
  );
}
