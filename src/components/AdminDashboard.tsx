import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Settings, 
  LogOut,
  Star,
  TrendingUp
} from 'lucide-react';
import { supabase, Vendor, Review } from '../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the rejection modal
  const [rejectionInfo, setRejectionInfo] = useState<{ id: string; name: string; reason: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // --- RESTORED FETCHDATA FUNCTION ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch vendor applications (pending, approved, rejected)
      const { data: applicationData, error: applicationError } = await supabase
        .from('vendor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationError) throw applicationError;

      // This fetch is restored from your original code
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorError) throw vendorError;

      // Fetch reviews
      const { data: reviewData, error: reviewError } = await supabase
        .from('customer_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewError) throw reviewError;

      // Use applications as the primary data source
      setVendors(applicationData || []);
      setReviews(reviewData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  // --- END OF RESTORED FUNCTION ---

  const updateVendorStatus = async (vendorId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      if (status === 'approved') {
        const { error } = await supabase.functions.invoke('approve_vendor', {
          body: { applicationId: vendorId },
        });
        if (error) throw error;

      } else if (status === 'rejected') {
        if (!reason || reason.trim() === '') {
          alert("A reason is required to reject an application.");
          return;
        }
        const { error } = await supabase.functions.invoke('reject_vendor', {
          body: { applicationId: vendorId, reason: reason.trim() },
        });
        if (error) throw error;
      }
      
      setRejectionInfo(null); // Close the modal on success
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating vendor status:', error);
      alert(`Failed to update status. Error: ${(error as Error).message}`);
    }
  };

  const stats = {
    total: vendors.length,
    pending: vendors.filter(v => v.status === 'pending').length,
    approved: vendors.filter(v => v.status === 'approved').length,
    rejected: vendors.filter(v => v.status === 'rejected').length,
    guides: vendors.filter(v => v.service_type === 'guide' && v.status === 'approved').length,
    marketplace: vendors.filter(v => v.service_type === 'marketplace' && v.status === 'approved').length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0'
  };
  
  const processedApplications = stats.approved + stats.rejected;
  const approvalRate = processedApplications > 0 
    ? Math.round((stats.approved / processedApplications) * 100) 
    : 0;

  const Sidebar = () => (
    <div className="bg-white shadow-xl h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600">Tourism Management</p>
      </div>
      
      <nav className="mt-6 flex-grow">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'pending', label: 'Pending Applications', icon: Clock },
          { id: 'guides', label: 'Tour Guides', icon: Users },
          { id: 'marketplace', label: 'Marketplace', icon: Users },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                activeTab === item.id ? 'bg-green-50 border-r-4 border-green-500 text-green-700 font-semibold' : 'text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
  
  const DashboardView = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-gray-600">Total Applications</div>
        </div>
        {/* Pending */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="text-gray-600">Pending Review</div>
        </div>
        {/* Approved */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-gray-600">Approved</div>
        </div>
        {/* Avg Rating */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-amber-600">{stats.avgRating}</div>
            <Star className="w-8 h-8 text-amber-500" />
          </div>
          <div className="text-gray-600">Avg Rating</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Types */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Approved Service Types</h3>
           <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Tour Guides</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.approved > 0 ? (stats.guides / stats.approved) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.guides}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Marketplace Vendors</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${stats.approved > 0 ? (stats.marketplace / stats.approved) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.marketplace}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Approval Rate */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Approval Rate</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{approvalRate}%</div>
            <div className="text-gray-600">Of Processed Applications</div>
            <div className="mt-4 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${approvalRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PendingApplications = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Applications</h1>
      <div className="space-y-6">
        {vendors.filter(v => v.status === 'pending').map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
                <p className="text-gray-600">{vendor.email} • {vendor.phone}</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mt-2">
                  {vendor.service_type === 'guide' ? 'Tour Guide' : 'Marketplace Vendor'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Applied</div>
                <div className="text-sm font-medium">{new Date(vendor.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Description:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{vendor.description}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => updateVendorStatus(vendor.id, 'approved')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              > <CheckCircle className="w-4 h-4 mr-2" /> Approve </button>
              <button
                onClick={() => setRejectionInfo({ id: vendor.id, name: vendor.name, reason: '' })}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              > <XCircle className="w-4 h-4 mr-2" /> Reject </button>
            </div>
          </div>
        ))}
        {vendors.filter(v => v.status === 'pending').length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">No pending applications</div>
          </div>
        )}
      </div>
    </div>
  );

  const VendorsList = ({ serviceType }: { serviceType: 'guide' | 'marketplace' }) => (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {serviceType === 'guide' ? 'Approved Tour Guides' : 'Approved Marketplace Vendors'}
      </h1>
      <div className="space-y-6">
        {vendors.filter(v => v.service_type === serviceType && v.status === 'approved').map((vendor) => {
            const vendorReviews = reviews.filter(r => r.vendor_id === vendor.id); // Note: vendor_id should match vendor.id
            const avgRating = vendorReviews.length > 0 
              ? (vendorReviews.reduce((acc, r) => acc + r.rating, 0) / vendorReviews.length).toFixed(1)
              : '0';
            return (
              <div key={vendor.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
                    <p className="text-gray-600">{vendor.email} • {vendor.phone}</p>
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm font-medium">{avgRating}/5</span>
                      <span className="ml-2 text-sm text-gray-500">({vendorReviews.length} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Approved</div>
                    <div className="text-sm font-medium"> {new Date(vendor.updated_at).toLocaleDateString()} </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{vendor.description}</p>
              </div>
            );
          })}
        {vendors.filter(v => v.service_type === serviceType && v.status === 'approved').length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">No approved {serviceType === 'guide' ? 'guides' : 'vendors'} yet</div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
        {rejectionInfo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Reject Application for {rejectionInfo.name}</h2>
                    <p className="text-gray-600 mb-4">Please provide a reason for rejecting this application. This will be saved for your records and may be shown to the vendor.</p>
                    <textarea
                        value={rejectionInfo.reason}
                        onChange={(e) => setRejectionInfo({ ...rejectionInfo, reason: e.target.value })}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Incomplete information provided, does not meet our quality standards..."
                    />
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setRejectionInfo(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button 
                            onClick={() => updateVendorStatus(rejectionInfo.id, 'rejected', rejectionInfo.reason)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            </div>
        )}

      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'pending' && <PendingApplications />}
        {activeTab === 'guides' && <VendorsList serviceType="guide" />}
        {activeTab === 'marketplace' && <VendorsList serviceType="marketplace" />}
      </div>
    </div>
  );
};

export default AdminDashboard;