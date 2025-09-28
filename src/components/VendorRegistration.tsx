import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, FileText, CheckCircle, DollarSign, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BUCKET = 'vendor-images'; // bucket name in Supabase
const FOLDER = 'profiles';      // folder inside bucket
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const VendorRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: 'guide' as 'guide' | 'marketplace',
    description: '',
    specialties: [] as string[],
    languages: [] as string[],
    experience_years: '',
    location: '',
    cost_per_day: '',
    cost_per_hour: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInput = (field: 'specialties' | 'languages', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError('');
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Use PNG, JPG, WebP or GIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Max 5 MB.');
      return;
    }

    setImageFile(file);

    // show preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImageAndGetUrl = async (file: File, guideName: string): Promise<string | null> => {
  try {
    const ext = file.name.split('.').pop();
    const safeName = guideName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")        // replace spaces with underscores
      .replace(/[^a-z0-9_]/g, ""); // remove invalid characters

    const filePath = `${FOLDER}/${safeName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: true }); // overwrite if same name

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("Error uploading image:", err);
    return null;
  }
};



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    if (!imageFile) {
      setError('Please upload a profile image.');
      setLoading(false);
      return;
    }

    // Upload image using guide's name as the filename
    const uploadedUrl = await uploadImageAndGetUrl(imageFile, formData.name);
    if (!uploadedUrl) throw new Error('Image upload failed.');

    // Build application object
    const applicationData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      service_type: formData.service_type,
      description: formData.description.trim(),
      specialties: formData.specialties,
      languages: formData.languages,
      experience_years: formData.experience_years
        ? parseInt(formData.experience_years)
        : null,
      location: formData.location.trim(),
      cost_per_day: formData.cost_per_day
        ? parseFloat(formData.cost_per_day)
        : null,
      cost_per_hour: formData.cost_per_hour
        ? parseFloat(formData.cost_per_hour)
        : null,
      profile_image_url: uploadedUrl,
      status: 'pending'
    };

    const { error: insertError } = await supabase
      .from('vendor_applications')
      .insert([applicationData]);

    if (insertError) throw insertError;

    // Reset form
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      service_type: 'guide',
      description: '',
      specialties: [],
      languages: [],
      experience_years: '',
      location: '',
      cost_per_day: '',
      cost_per_hour: ''
    });
    setImageFile(null);
    setImagePreview('');
  } catch (err) {
    console.error('Error submitting application:', err);
    setError('Failed to submit application. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest. Your application has been submitted and will be reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-amber-600 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Become a Vendor</h1>
          <p className="text-green-100">Join Jharkhand's tourism network and connect with travelers</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <select
                name="service_type"
                required
                value={formData.service_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="guide">Tour Guide</option>
                
              </select>
            </div>

            {/* Location */}
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

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience_years"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="5"
              />
            </div>

            {/* Cost Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Cost Per Day
              </label>
              <input
                type="number"
                name="cost_per_day"
                min="0"
                step="0.01"
                value={formData.cost_per_day}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 2500"
              />
            </div>

            {/* Cost Per Hour */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Cost Per Hour
              </label>
              <input
                type="number"
                name="cost_per_hour"
                min="0"
                step="0.01"
                value={formData.cost_per_hour}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 400"
              />
            </div>

            {/* Profile Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Profile Image *
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 w-32 h-32 object-cover rounded-lg border"
                />
              )}
            </div>
          </div>

          {/* Description */}
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
              placeholder="Describe your services, experience, and what makes you unique..."
            />
          </div>

          {/* Specialties & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
              </label>
              <input
                type="text"
                value={formData.specialties.join(', ')}
                onChange={(e) => handleArrayInput('specialties', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Wildlife, Trekking, Cultural Tours (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <input type="text" value={formData.languagesString || ""} onChange={(e) => { const str = e.target.value; setFormData({ ...formData, languagesString: str, languages: str.split(",").map((l) => l.trim()).filter(Boolean) }); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Hindi, English, Santhali" />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;
