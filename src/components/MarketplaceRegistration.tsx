import React, { useState } from 'react';
import { Package, User, MapPin, FileText,  CheckCircle, DollarSign, Image, Tag, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MarketplaceRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    description: '',
    features: [] as string[],
    location: '',
    price: '',
    original_price: '',
    shipping_time: '3-5 days',
    artisan: '',
    village: '',
    producer: '',
    weight: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Handicrafts',
    'Textiles',
    'Jewelry',
    'Food Products',
    'Artwork', 
    'Traditional Items',
    'Pottery',
    'Woodwork',
    'Metalwork',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInput = (field: 'features', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, fileName: string): Promise<string | null> => {
    try {
      const fileExtension = file.name.split('.').pop();
      const imagePath = `${fileName}.${fileExtension}`;
      
      const { error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(imagePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;
      
      return imagePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imagePath = '';
      
      // Upload image if provided
      if (imageFile && formData.name) {
        const uploadedPath = await uploadImage(imageFile, formData.name);
        if (uploadedPath) {
          imagePath = uploadedPath;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Create marketplace item data
      const marketplaceData = {
        name: formData.name.trim(),
        category: formData.category,
        type: formData.type.trim(),
        description: formData.description.trim(),
        features: formData.features,
        location: formData.location.trim(),
        image_path: imagePath,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        shipping_time: formData.shipping_time,
        artisan: formData.artisan.trim(),
        village: formData.village.trim(),
        producer: formData.producer.trim(),
        weight: formData.weight.trim(),
        status: 'pending',
        in_stock: true,
        rating: 0,
        reviews: 0
      };

      const { error: insertError } = await supabase
        .from('marketplace')
        .insert([marketplaceData]);

      if (insertError) throw insertError;

      setSubmitted(true);
      // Clear form
      setFormData({
        name: '',
        category: '',
        type: '',
        description: '',
        features: [],
        location: '',
        price: '',
        original_price: '',
        shipping_time: '3-5 days',
        artisan: '',
        village: '',
        producer: '',
        weight: ''
      });
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error submitting marketplace item:', error);
      setError('Failed to submit marketplace item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for adding your product to our marketplace. Your item has been submitted 
            and is now under review. Once approved, it will be visible to customers.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>What's next?</strong><br />
              • Our team will review your product listing<br />
              • You'll receive notification once it's approved<br />
              • Approved items will appear in the marketplace<br />
              • You can track orders and manage inventory
            </p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 bg-gradient-to-r from-green-600 to-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-amber-700 transition-colors"
          >
            Add Another Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-amber-600 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Add Marketplace Product</h1>
          <p className="text-green-100">Share your local products with tourists and travelers</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a type</option>
                <option value="Handicraft">Handicraft</option>
                <option value="Produce">Produce</option>
                <option value="Textile">Textile</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter selling price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Original Price (₹)
              </label>
              <input
                type="number"
                name="original_price"
                min="0"
                step="0.01"
                value={formData.original_price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter original price (if discounted)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="City, District"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Artisan/Maker
              </label>
              <input
                type="text"
                name="artisan"
                value={formData.artisan}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Name of the artisan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Village/Origin
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Village or place of origin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producer/Brand
              </label>
              <input
                type="text"
                name="producer"
                value={formData.producer}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Producer or brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight/Size
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 500g, Large, 30cm x 20cm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Truck className="w-4 h-4 inline mr-2" />
                Shipping Time
              </label>
              <select
                name="shipping_time"
                value={formData.shipping_time}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="1-2 days">1-2 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                Product Image *
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe your product, its uniqueness, materials used, cultural significance..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features & Highlights
            </label>
            <input
              type="text"
              value={formData.features.join(', ')}
              onChange={(e) => handleArrayInput('features', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Handmade, Eco-friendly, Traditional design (comma separated)"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplaceRegistration;