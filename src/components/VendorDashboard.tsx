import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Star, MessageSquare, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const VendorDashboard: React.FC = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [vendorData, setVendorData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setApplicationData(null);
    setVendorData(null);
    setReviews([]);

    try {
      const email = searchEmail.trim();

      // Search for application
      const { data: appData, error: appError } = await supabase
        .from('vendor_applications')
        .select('*')
        .ilike('email', email) 
        .single();
      
      // Add these two lines for debugging
      console.log("Supabase Application Error:", appError);
      console.log("Supabase Application Data:", appData);

      if (appError && appError.code !== 'PGRST116') {
        throw appError;
      }

      // Search for vendor (if approved)
      const { data: vendorInfo, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .ilike('email', email)
        .single();

      if (vendorError && vendorError.code !== 'PGRST116') {
        throw vendorError;
      }

      // Get reviews if vendor exists
      let reviewData = [];
      if (vendorInfo) {
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('customer_reviews')
          .select('*')
          .eq('vendor_id', vendorInfo.id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          reviewData = reviewsData || [];
        }
      }

      setApplicationData(appData);
      setVendorData(vendorInfo);
      setReviews(reviewData);
      setHasSearched(true);

    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search for your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchEmail('');
    setApplicationData(null);
    setVendorData(null);
    setReviews([]);
    setHasSearched(false);
    setError('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vendor Dashboard</h1>
        
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Track Your Application
          </h2>
          <p className="text-gray-600 mb-4">
            Enter the email address you used when applying to check your application status.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={!searchEmail.trim() || loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {hasSearched && (
              <button
                onClick={clearSearch}
                disabled={loading}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Searching for your application...</span>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !loading && !applicationData && !vendorData && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              No applications found for this email address
            </div>
            <div className="text-sm text-gray-400">
              Make sure you're using the same email address you used when applying
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && (applicationData || vendorData) && (
          <div className="space-y-6">
            {/* Application Status */}
            {applicationData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{applicationData.name}</h3>
                    <p className="text-gray-600">{applicationData.email}</p>
                    <p className="text-gray-600">{applicationData.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(applicationData.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicationData.status)}`}>
                      {applicationData.status.charAt(0).toUpperCase() + applicationData.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Application Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Service Type:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {applicationData.service_type === 'guide' ? 'Tour Guide' : 'Marketplace Vendor'}
                        </span>
                      </div>
                      {applicationData.location && (
                        <div>
                          <span className="text-sm text-gray-500">Location:</span>
                          <span className="text-sm text-gray-700 ml-2">{applicationData.location}</span>
                        </div>
                      )}
                      {applicationData.experience_years && (
                        <div>
                          <span className="text-sm text-gray-500">Experience:</span>
                          <span className="text-sm text-gray-700 ml-2">{applicationData.experience_years} years</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Applied: {new Date(applicationData.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {applicationData.description}
                    </p>
                  </div>
                </div>

                {/* Status Messages */}
                {applicationData.status === 'pending' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Your application is under review. You'll be notified once it's processed.
                    </p>
                  </div>
                )}

                {applicationData.status === 'approved' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Congratulations! Your application has been approved and you're now listed in our directory.
                    </p>
                  </div>
                )}

                {applicationData.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Your application was not approved. 
                      {applicationData.rejection_reason && (
                        <span className="block mt-1">Reason: {applicationData.rejection_reason}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Vendor Profile (if approved) */}
            {vendorData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Your Vendor Profile</h3>
                    <p className="text-gray-600">Active since {new Date(vendorData.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">{getAverageRating()}/5</span>
                    <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                  </div>
                </div>

                {/* Reviews Section */}
                {reviews.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Customer Reviews
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{review.customer_name}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-sm">{review.comment}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400">Reviews from customers will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">
              Enter your email address above to check your application status
            </div>
            <div className="text-sm text-gray-400">
              This will show your application status and any reviews if you're an approved vendor
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;