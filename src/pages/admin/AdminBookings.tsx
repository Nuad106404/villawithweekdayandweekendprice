import { useCallback, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  fetchBookings, 
  updateBooking, 
  updateBookingStatus, 
  deleteBooking,
  sendConfirmationEmail 
} from '../../store/slices/bookingSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Loader2, MoreVertical } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';
import { ChevronUpIcon, SearchIcon } from 'lucide-react';
import cn from 'classnames';
import { X } from 'lucide-react';
import { Pagination } from '../../components/ui/pagination';
import { VisuallyHidden } from '../../components/ui/visually-hidden';
import { Download } from 'lucide-react';
import { Users } from 'lucide-react';
import { Mail } from 'lucide-react';

type BookingStatus = 
  | 'pending' 
  | 'pending_payment' 
  | 'in_review' 
  | 'confirmed' 
  | 'cancelled' 
  | 'expired' 
  | 'checked_in' 
  | 'checked_out';

interface Booking {
  _id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    totalPrice: number;
  };
  status: BookingStatus;
  paymentMethod: 'bank_transfer' | 'promptpay';
  paymentSlipUrl: string;
  createdAt: string;
}

interface EditForm {
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    totalPrice: number;
  };
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'in_review', label: 'In Review' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
];

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending_payment':
      return 'bg-orange-100 text-orange-800';
    case 'in_review':
      return 'bg-blue-100 text-blue-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    case 'checked_in':
      return 'bg-purple-100 text-purple-800';
    case 'checked_out':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminBookings() {
  const dispatch = useDispatch<AppDispatch>();
  const bookingState = useSelector((state: RootState) => state.booking);
  const { bookings = [], loading = false, error = null } = bookingState || {};

  // Pagination states
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  // Search and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Booking | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch bookings on mount
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Initialize edit form when opening edit dialog
  useEffect(() => {
    if (selectedBooking && isEditDialogOpen) {
      setEditForm({
        customerInfo: { ...selectedBooking.customerInfo },
        bookingDetails: { ...selectedBooking.bookingDetails },
      });
    }
  }, [selectedBooking, isEditDialogOpen]);

  const handleViewDetails = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setIsViewDialogOpen(false);
    setTimeout(() => {
      setSelectedBooking(null);
    }, 200);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditDialogOpen(false);
    setTimeout(() => {
      setSelectedBooking(null);
      setEditForm(null);
    }, 200);
  }, []);

  const handleInputChange = useCallback((section: keyof EditForm, field: string, value: string | number) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  }, []);

  const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !editForm) return;

    try {
      await dispatch(updateBooking({
        id: selectedBooking._id,
        data: editForm,
      })).unwrap();

      toast.success('Booking updated successfully');
      handleCloseEdit();
      dispatch(fetchBookings()); // Refresh the list
    } catch (error) {
      toast.error('Failed to update booking');
    }
  }, [dispatch, selectedBooking, editForm, handleCloseEdit]);

  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = useCallback(async (bookingId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await dispatch(updateBookingStatus({ bookingId, status: newStatus })).unwrap();
      toast.success('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsUpdating(false);
    }
  }, [dispatch]);

  const handleDeleteBooking = useCallback(async (id: string) => {
    try {
      await dispatch(deleteBooking(id)).unwrap();
      toast.success('Booking deleted successfully');
      dispatch(fetchBookings()); // Refresh the list
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  }, [dispatch]);

  const handleSort = useCallback((key: keyof Booking) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const sortedAndFilteredBookings = useMemo(() => {
    let result = [...bookings];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase().trim();
      result = result.filter((booking) => {
        // Search in customer name (both first and last name)
        const fullName = `${booking.customerInfo?.firstName || ''} ${booking.customerInfo?.lastName || ''}`.toLowerCase();
        if (fullName.includes(searchLower)) return true;

        // Search in phone number - remove spaces and special characters for comparison
        const searchPhone = searchLower.replace(/[\s-\(\)]/g, '');
        const bookingPhone = (booking.customerInfo?.phone || '').replace(/[\s-\(\)]/g, '');
        if (bookingPhone.includes(searchPhone)) return true;

        // Search in email
        const email = (booking.customerInfo?.email || '').toLowerCase();
        if (email.includes(searchLower)) return true;

        return false;
      });
    }

    // Apply sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        // Handle nested paths
        if (sortConfig.key.includes('.')) {
          const [section, field] = sortConfig.key.split('.');
          aValue = a[section as keyof Booking]?.[field as any];
          bValue = b[section as keyof Booking]?.[field as any];
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        // Handle undefined values
        if (aValue === undefined) aValue = '';
        if (bValue === undefined) bValue = '';

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [bookings, debouncedSearch, sortConfig]);

  // Calculate pagination
  const totalItems = sortedAndFilteredBookings.length;
  const pageCount = Math.ceil(totalItems / pageSize);
  const paginatedBookings = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return sortedAndFilteredBookings.slice(start, end);
  }, [sortedAndFilteredBookings, pageIndex, pageSize]);

  // Reset page index when search changes
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  // Handle pagination changes
  const handlePageChange = useCallback((newPage: number) => {
    setPageIndex(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0);
  }, []);

  const getStatusBadge = useCallback((status: BookingStatus) => (
    <Badge className={getStatusBadgeColor(status)}>
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </Badge>
  ), []);

  const getAvailableActions = useCallback((status: BookingStatus) =>
    statusOptions.filter((option) => option.value !== status), []);

  const handleDownloadSlip = async (url: string) => {
    try {
      // Fetch the image
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extract filename from URL or use default
      const filename = url.split('/').pop() || 'payment-slip.jpg';
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading slip:', error);
      toast.error('Failed to download payment slip');
    }
  };

  const handleSendConfirmation = async (bookingId: string) => {
    try {
      await dispatch(sendConfirmationEmail(bookingId));
      toast.success('Confirmation email sent successfully');
    } catch (error) {
      toast.error('Failed to send confirmation email');
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm('')}
              className="h-9 px-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort('customerInfo.firstName')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Customer {sortConfig.key === 'customerInfo.firstName' && (
                    <ChevronUpIcon
                      className={cn(
                        "ml-2 h-4 w-4 inline",
                        sortConfig.direction === 'desc' && "rotate-180"
                      )}
                    />
                  )}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead
                  onClick={() => handleSort('bookingDetails.checkIn')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Check In {sortConfig.key === 'bookingDetails.checkIn' && (
                    <ChevronUpIcon
                      className={cn(
                        "ml-2 h-4 w-4 inline",
                        sortConfig.direction === 'desc' && "rotate-180"
                      )}
                    />
                  )}
                </TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead
                  onClick={() => handleSort('status')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Status {sortConfig.key === 'status' && (
                    <ChevronUpIcon
                      className={cn(
                        "ml-2 h-4 w-4 inline",
                        sortConfig.direction === 'desc' && "rotate-180"
                      )}
                    />
                  )}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin inline-block" />
                  </TableCell>
                </TableRow>
              ) : paginatedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      {booking.customerInfo?.firstName} {booking.customerInfo?.lastName}
                    </TableCell>
                    <TableCell>{booking.customerInfo?.email || 'N/A'}</TableCell>
                    <TableCell>{booking.customerInfo?.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {booking.bookingDetails?.checkIn
                        ? dayjs(booking.bookingDetails.checkIn).format('MMM D, YYYY')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {booking.bookingDetails?.checkOut
                        ? dayjs(booking.bookingDetails.checkOut).format('MMM D, YYYY')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {booking.bookingDetails.rooms} 
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof booking.bookingDetails?.totalPrice === 'number'
                        ? `฿${booking.bookingDetails.totalPrice.toLocaleString()}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status.replace('_', ' ').charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleViewDetails(booking)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleEditClick(booking)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {getAvailableActions(booking.status).map((action) => (
                              <DropdownMenuItem
                                key={action.value}
                                onClick={() => handleStatusChange(booking._id, action.value)}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleSendConfirmation(booking._id)}
                              className="gap-2"
                            >
                              <Mail className="h-4 w-4" />
                              Send Confirmation Email
                            </DropdownMenuItem>
                            {booking.paymentSlipUrl && (
                              <DropdownMenuItem
                                onClick={() => window.open(booking.paymentSlipUrl, '_blank')}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                View Payment Slip
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteBooking(booking._id)}
                            >
                              Delete Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={pageCount}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {selectedBooking && (
        <>
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <VisuallyHidden>
                  <DialogTitle>View Details</DialogTitle>
                </VisuallyHidden>
              </DialogHeader>
              {selectedBooking && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Slip (Left Column) */}
                  <div className="bg-red-100 rounded-lg p-4">
                    {selectedBooking.paymentSlipUrl ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                        <img
                          src={selectedBooking.paymentSlipUrl}
                          alt="Payment Slip"
                          className="max-w-full max-h-[500px] object-contain rounded-lg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => handleDownloadSlip(selectedBooking.paymentSlipUrl)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Slip
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No Payment Slip
                      </div>
                    )}
                  </div>

                  {/* Booking Information (Right Column) */}
                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Customer Information</h3>
                      <div className="grid gap-2">
                        <div>
                          <span className="font-medium">Name: </span>
                          <span>{selectedBooking.customerInfo.firstName} {selectedBooking.customerInfo.lastName}</span>
                        </div>
                        <div>
                          <span className="font-medium">Email: </span>
                          <span>{selectedBooking.customerInfo.email}</span>
                        </div>
                        <div>
                          <span className="font-medium">Phone: </span>
                          <span>{selectedBooking.customerInfo.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Booking Details</h3>
                      <div className="grid gap-2">
                        <div>
                          <span className="font-medium">Check In: </span>
                          <span>{new Date(selectedBooking.bookingDetails.checkIn).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Check Out: </span>
                          <span>{new Date(selectedBooking.bookingDetails.checkOut).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {selectedBooking.bookingDetails.rooms} 
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Total Price: </span>
                          <span>฿{selectedBooking.bookingDetails.totalPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Status: </span>
                          <Badge
                            variant={
                              selectedBooking.status === 'confirmed'
                                ? 'default'
                                : selectedBooking.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Payment Method: </span>
                          <span className="capitalize">{selectedBooking.paymentMethod?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) handleCloseEdit();
            }}
          >
            <DialogContent
              size="xl"
              onEscapeKeyDown={handleCloseEdit}
              onPointerDownOutside={handleCloseEdit}
              onInteractOutside={(e) => {
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                }
              }}
              className="max-w-4xl"
            >
              <form onSubmit={handleEditSubmit} className="space-y-6">
              <VisuallyHidden>
                  <DialogTitle>Edit Details</DialogTitle>
                </VisuallyHidden>
                <div>
                  <h4 className="font-medium mb-4">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm?.customerInfo.firstName || ''}
                        onChange={(e) => handleInputChange('customerInfo', 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm?.customerInfo.lastName || ''}
                        onChange={(e) => handleInputChange('customerInfo', 'lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm?.customerInfo.email || ''}
                        onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editForm?.customerInfo.phone || ''}
                        onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Booking Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkIn">Check In</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={editForm?.bookingDetails.checkIn ? dayjs(editForm.bookingDetails.checkIn).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleInputChange('bookingDetails', 'checkIn', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOut">Check Out</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={editForm?.bookingDetails.checkOut ? dayjs(editForm.bookingDetails.checkOut).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleInputChange('bookingDetails', 'checkOut', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="rooms">Rooms</Label>
                      <Input
                        id="rooms"
                        type="number"
                        min="1"
                        value={editForm?.bookingDetails.rooms || ''}
                        onChange={(e) => handleInputChange('bookingDetails', 'rooms', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalPrice">Total Price</Label>
                      <Input
                        id="totalPrice"
                        type="number"
                        min="0"
                        value={editForm?.bookingDetails.totalPrice || ''}
                        onChange={(e) => handleInputChange('bookingDetails', 'totalPrice', parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseEdit}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
