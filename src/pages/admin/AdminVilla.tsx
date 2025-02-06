import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchVillaDetails, updateVillaDetails, setVilla } from '../../store/slices/villaSlice';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { villaApi } from '../../services/api';
import { X } from 'lucide-react';

interface FormData {
  name: {
    en: string;
    th: string;
  };
  title: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  beachfront: {
    en: string;
    th: string;
  };
  weekdayPrice: number;
  weekdayDiscountedPrice: number;
  weekendPrice: number;
  weekendDiscountedPrice: number;
  priceReductionPerRoom: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  minRooms: number;
  backgroundImage?: string;
  newBackgroundImage?: File;
  slideImages: string[];
  newSlideImages?: FileList;
  rooms: {
    name: {
      en: string;
      th: string;
    };
    description: {
      en: string;
      th: string;
    };
    images: string[];
  }[];
}

const defaultFormData: FormData = {
  name: { en: '', th: '' },
  title: { en: '', th: '' },
  description: { en: '', th: '' },
  beachfront: { en: '', th: '' },
  weekdayPrice: 0,
  weekdayDiscountedPrice: 0,
  weekendPrice: 0,
  weekendDiscountedPrice: 0,
  priceReductionPerRoom: 0,
  maxGuests: 6,
  bedrooms: 3,
  bathrooms: 3,
  minRooms: 1,
  slideImages: [],
  rooms: []
};

export default function AdminVilla() {
  const dispatch = useDispatch();
  const { villa, loading } = useSelector((state: RootState) => state.villa);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [promptPayQR, setPromptPayQR] = useState<File | null>(null);
  const [promptPayQRPreview, setPromptPayQRPreview] = useState('');
  const [roomFormData, setRoomFormData] = useState({
    name: { th: '', en: '' },
    description: { th: '', en: '' },
    images: [] as File[]
  });
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchVillaDetails());
  }, [dispatch]);

  useEffect(() => {
    if (villa) {
      setFormData({
        name: villa.name || { en: '', th: '' },
        title: villa.title || { en: '', th: '' },
        description: villa.description || { en: '', th: '' },
        beachfront: villa.beachfront || { en: '', th: '' },
        weekdayPrice: villa.weekdayPrice || 0,
        weekdayDiscountedPrice: villa.weekdayDiscountedPrice || 0,
        weekendPrice: villa.weekendPrice || 0,
        weekendDiscountedPrice: villa.weekendDiscountedPrice || 0,
        priceReductionPerRoom: villa.priceReductionPerRoom || 0,
        maxGuests: villa.maxGuests || 6,
        bedrooms: villa.bedrooms || 3,
        bathrooms: villa.bathrooms || 3,
        minRooms: villa.minRooms || 1,
        backgroundImage: villa.backgroundImage,
        slideImages: villa.slideImages || [],
        rooms: villa.rooms || []
      });
      setPromptPayQRPreview(villa.promptPay?.qrImage || '');
    }
  }, [villa]);

  const handleInputChange = (
    field: string,
    value: string | number,
    lang?: 'en' | 'th'
  ) => {
    setFormData((prev) => {
      if (lang) {
        return {
          ...prev,
          [field]: {
            ...prev[field as keyof typeof prev],
            [lang]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleBackgroundImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      const response = await villaApi.uploadBackgroundImage(file);
      setFormData(prev => ({
        ...prev,
        backgroundImage: response.backgroundImage
      }));
      toast({
        title: "Success",
        description: "Background image updated successfully",
        status: "success"
      });
    } catch (error) {
      console.error('Error uploading background image:', error);
      toast({
        title: "Error",
        description: "Failed to upload background image",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBackground = async () => {
    try {
      setIsSubmitting(true);
      await villaApi.deleteBackgroundImage();
      toast.success('Background image deleted successfully');
      dispatch(fetchVillaDetails());
    } catch (error) {
      console.error('Error deleting background image:', error);
      toast.error('Failed to delete background image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlideImagesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array and validate total count
    const fileArray = Array.from(files);
    if (fileArray.length > 50) {
      toast({
        title: "Error",
        description: "Maximum 50 images allowed",
        status: "error"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Show upload starting toast
      toast({
        title: "Info",
        description: `Starting upload of ${fileArray.length} images...`,
        status: "info"
      });

      const response = await villaApi.uploadSlideImages(fileArray);
      // Update form data by combining existing and new images
      setFormData(prev => ({
        ...prev,
        slideImages: [...prev.slideImages, ...response.slideImages]
      }));
      
      toast({
        title: "Success",
        description: `Successfully uploaded ${fileArray.length} images`,
        status: "success"
      });
    } catch (error: any) {
      console.error('Error uploading slide images:', error);
      // More specific error message
      const errorMessage = error.message?.includes('exceeds 5MB limit')
        ? error.message
        : 'Failed to upload images. Please try uploading fewer images at once or check your connection';
      toast({
        title: "Error",
        description: errorMessage,
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleDeleteSlideImage = async (index: number) => {
    if (!confirm('Are you sure you want to delete this slide image?')) return;

    setIsSubmitting(true);
    try {
      await villaApi.deleteSlideImage(index);
      setFormData(prev => ({
        ...prev,
        slideImages: prev.slideImages.filter((_, i) => i !== index)
      }));
      toast({
        title: "Success",
        description: "Slide image deleted successfully",
        status: "success"
      });
    } catch (error) {
      console.error('Error deleting slide image:', error);
      toast({
        title: "Error",
        description: "Failed to delete slide image",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Ensure all required fields are present and have valid values
      // Validate required fields
      if (!formData.name?.en || !formData.name?.th || 
          !formData.title?.en || !formData.title?.th || 
          !formData.description?.en || !formData.description?.th) {
        throw new Error('Please fill in all required text fields in both English and Thai');
      }

      // Convert and validate numeric fields
      const weekdayPrice = Number(formData.weekdayPrice);
      const weekdayDiscountedPrice = Number(formData.weekdayDiscountedPrice);
      const weekendPrice = Number(formData.weekendPrice);
      const weekendDiscountedPrice = Number(formData.weekendDiscountedPrice);
      const priceReductionPerRoom = Number(formData.priceReductionPerRoom);
      const maxGuests = Number(formData.maxGuests);
      const bedrooms = Number(formData.bedrooms);
      const bathrooms = Number(formData.bathrooms);
      const minRooms = Number(formData.minRooms);

      // Validate numeric fields
      if (weekdayPrice < 0 || weekendPrice < 0 || priceReductionPerRoom < 0 || 
          weekdayDiscountedPrice < 0 || weekendDiscountedPrice < 0) {
        throw new Error('Prices cannot be negative');
      }

      // Validate discounted prices
      if (weekdayDiscountedPrice > weekdayPrice) {
        throw new Error('Weekday discounted price cannot be greater than regular price');
      }
      if (weekendDiscountedPrice > weekendPrice) {
        throw new Error('Weekend discounted price cannot be greater than regular price');
      }

      if (minRooms > bedrooms) {
        throw new Error('Minimum rooms cannot be greater than total bedrooms');
      }

      const formDataToSubmit = {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        beachfront: formData.beachfront,
        weekdayPrice,
        weekdayDiscountedPrice,
        weekendPrice,
        weekendDiscountedPrice,
        priceReductionPerRoom,
        maxGuests,
        bedrooms,
        bathrooms,
        minRooms
      };

      console.log('Submitting form data:', formDataToSubmit);
      const response = await axios.patch('http://localhost:5001/api/admin/villa', formDataToSubmit);
      
      if (response.status === 200) {
        toast.success('Villa details updated successfully');
        
        // Update local state with formatted data
        setFormData(prev => ({
          ...prev,
        }));
      }
    } catch (error: any) {
      console.error('Error updating villa:', error);
      setError(error.response?.data?.message || 'Error updating villa details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let qrImageUrl = villa?.promptPay?.qrImage || '';

      if (promptPayQR) {
        const formData = new FormData();
        formData.append('image', promptPayQR);
        const { imageUrl } = await villaApi.uploadImage(formData);
        qrImageUrl = imageUrl;
      }

      await villaApi.updatePromptPay({ qrImage: qrImageUrl });
      toast.success('PromptPay QR updated successfully');
      dispatch(fetchVillaDetails());
    } catch (error) {
      toast.error('Failed to update PromptPay QR');
      console.error('Error updating PromptPay:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPromptPayQR(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromptPayQRPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePromptPayQR = async () => {
    try {
      await villaApi.updatePromptPay({ qrImage: '' });
      toast.success('PromptPay QR deleted successfully');
      dispatch(fetchVillaDetails());
    } catch (error) {
      toast.error('Failed to delete PromptPay QR');
      console.error('Error deleting PromptPay QR:', error);
    }
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await villaApi.addRoom(
        roomFormData.name,
        roomFormData.description,
        roomFormData.images
      );

      setFormData(prev => ({
        ...prev,
        rooms: response.villa.rooms
      }));

      // Reset room form
      setRoomFormData({
        name: { th: '', en: '' },
        description: { th: '', en: '' },
        images: []
      });

      toast({
        title: "Success",
        description: "Room added successfully",
        status: "success"
      });
    } catch (error) {
      console.error('Error adding room:', error);
      toast({
        title: "Error",
        description: "Failed to add room",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (index: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    setIsSubmitting(true);
    try {
      const response = await villaApi.deleteRoom(index);
      setFormData(prev => ({
        ...prev,
        rooms: response.villa.rooms
      }));
      toast({
        title: "Success",
        description: "Room deleted successfully",
        status: "success"
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!villa && loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Villa Settings</h1>
      
      <Card className="max-w-2xl">
        <div className="space-y-6 p-6">
          {/* Main Villa Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Background Image Upload */}
            <div className="mb-6 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Background Image</h2>
              <div className="flex items-center gap-4">
                {formData.backgroundImage && (
                  <div className="relative">
                    <img
                      src={formData.backgroundImage}
                      alt="Villa background"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={handleDeleteBackground}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended size: 1920x1080px. Max file size: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Slide Images Upload */}
            <div className="mb-6 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Slide Images</h2>
              <div className="space-y-4">
                {formData.slideImages && formData.slideImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {/* Image Count Display */}
                    <div className="col-span-full mb-2 text-sm text-gray-600">
                      {t('admin.villa.totalImages', { count: formData.slideImages.length })}
                    </div>
                    {formData.slideImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2"
                          onClick={() => handleDeleteSlideImage(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSlideImagesChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('admin.villa.imageUploadInstructions')}
                  </p>
                </div>
              </div>
            </div>

            {/* English Name */}
            <div className="space-y-2">
              <Label htmlFor="name-en">Villa Name (English)</Label>
              <Input
                id="name-en"
                value={formData.name.en}
                onChange={(e) => handleInputChange('name', e.target.value, 'en')}
                placeholder="Enter villa name in English"
                className="w-full"
                required
              />
            </div>

            {/* Thai Name */}
            <div className="space-y-2">
              <Label htmlFor="name-th">Villa Name (Thai)</Label>
              <Input
                id="name-th"
                value={formData.name.th}
                onChange={(e) => handleInputChange('name', e.target.value, 'th')}
                placeholder="Enter villa name in Thai"
                className="w-full"
                required
              />
            </div>

            {/* English Title */}
            <div className="space-y-2">
              <Label htmlFor="title-en">Hero Title (English)</Label>
              <Input
                id="title-en"
                value={formData.title.en}
                onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                placeholder="Enter hero title in English"
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                This title will be displayed in the hero section of the homepage
              </p>
            </div>

            {/* Thai Title */}
            <div className="space-y-2">
              <Label htmlFor="title-th">Hero Title (Thai)</Label>
              <Input
                id="title-th"
                value={formData.title.th}
                onChange={(e) => handleInputChange('title', e.target.value, 'th')}
                placeholder="Enter hero title in Thai"
                className="w-full"
                required
              />
            </div>

            {/* English Description */}
            <div className="space-y-2">
              <Label htmlFor="description-en">Description (English)</Label>
              <textarea
                id="description-en"
                value={formData.description.en}
                onChange={(e) => handleInputChange('description', e.target.value, 'en')}
                placeholder="Enter description in English"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md border-input bg-background resize-y"
                required
              />
            </div>

            {/* Thai Description */}
            <div className="space-y-2">
              <Label htmlFor="description-th">Description (Thai)</Label>
              <textarea
                id="description-th"
                value={formData.description.th}
                onChange={(e) => handleInputChange('description', e.target.value, 'th')}
                placeholder="Enter description in Thai"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md border-input bg-background resize-y"
                required
              />
            </div>

            {/* English Beachfront */}
            <div className="space-y-2">
              <Label htmlFor="beachfront-en">Beachfront Description (English)</Label>
              <Input
                id="beachfront-en"
                value={formData.beachfront.en}
                onChange={(e) => handleInputChange('beachfront', e.target.value, 'en')}
                placeholder="Enter beachfront description in English"
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                This text appears in the villa description section
              </p>
            </div>

            {/* Thai Beachfront */}
            <div className="space-y-2">
              <Label htmlFor="beachfront-th">Beachfront Description (Thai)</Label>
              <Input
                id="beachfront-th"
                value={formData.beachfront.th}
                onChange={(e) => handleInputChange('beachfront', e.target.value, 'th')}
                placeholder="Enter beachfront description in Thai"
                className="w-full"
                required
              />
            </div>

            {/* Pricing Section */}
            <div className="mt-8 p-4 border rounded-lg space-y-6">
              <h2 className="text-xl font-semibold">{t('admin.villa.pricing')}</h2>
              
              {/* Weekday Prices */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <h3 className="font-medium">{t('admin.villa.weekdayPrices')}</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="weekdayPrice">{t('admin.villa.regularPrice')}</Label>
                  <Input
                    type="number"
                    id="weekdayPrice"
                    name="weekdayPrice"
                    value={formData.weekdayPrice}
                    onChange={(e) => handleInputChange('weekdayPrice', Number(e.target.value))}
                    className="max-w-xs"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekdayDiscountedPrice">{t('admin.villa.discountedPrice')}</Label>
                  <Input
                    type="number"
                    id="weekdayDiscountedPrice"
                    name="weekdayDiscountedPrice"
                    value={formData.weekdayDiscountedPrice}
                    onChange={(e) => handleInputChange('weekdayDiscountedPrice', Number(e.target.value))}
                    className="max-w-xs"
                    min="0"
                  />
                  <p className="text-sm text-gray-500">
                    {t('admin.villa.discountedPriceDescription')}
                  </p>
                </div>
              </div>

              {/* Weekend Prices */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <h3 className="font-medium">{t('admin.villa.weekendPrices')}</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="weekendPrice">{t('admin.villa.regularPrice')}</Label>
                  <Input
                    type="number"
                    id="weekendPrice"
                    name="weekendPrice"
                    value={formData.weekendPrice}
                    onChange={(e) => handleInputChange('weekendPrice', Number(e.target.value))}
                    className="max-w-xs"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekendDiscountedPrice">{t('admin.villa.discountedPrice')}</Label>
                  <Input
                    type="number"
                    id="weekendDiscountedPrice"
                    name="weekendDiscountedPrice"
                    value={formData.weekendDiscountedPrice}
                    onChange={(e) => handleInputChange('weekendDiscountedPrice', Number(e.target.value))}
                    className="max-w-xs"
                    min="0"
                  />
                  <p className="text-sm text-gray-500">
                    {t('admin.villa.discountedPriceDescription')}
                  </p>
                </div>
              </div>

              {/* Price Reduction per Room */}
              <div className="space-y-2">
                <Label htmlFor="priceReductionPerRoom">{t('admin.villa.priceReductionPerRoom')}</Label>
                <Input
                  type="number"
                  id="priceReductionPerRoom"
                  name="priceReductionPerRoom"
                  value={formData.priceReductionPerRoom}
                  onChange={(e) => handleInputChange('priceReductionPerRoom', Number(e.target.value))}
                  className="max-w-xs"
                  min="0"
                  required
                />
                <p className="text-sm text-gray-500">
                  {t('admin.villa.priceReductionDescription')}
                </p>
              </div>
            </div>

            {/* Capacity Section */}
            <div className="mt-8 p-4 border rounded-lg space-y-6">
              <h2 className="text-xl font-semibold">{t('admin.villa.capacity')}</h2>

              {/* Max Guests */}
              <div className="space-y-2">
                <Label htmlFor="maxGuests">{t('admin.villa.maxGuests')}</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.maxGuests}
                  onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value))}
                  className="max-w-xs"
                  required
                />
                <p className="text-sm text-gray-500">
                  {t('admin.villa.maxGuestsDescription')}
                </p>
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
              <Label htmlFor="bedrooms">{t('admin.villa.bedrooms')}</Label>
              <Input
                id="bedrooms"
                type="number"
                min={1}
                max={20}
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                className="max-w-xs"
                required
              />
              <p className="text-sm text-gray-500">
                {t('admin.villa.bedroomsDescription')}
              </p>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label htmlFor="bathrooms">{t('admin.villa.bathrooms')}</Label>
              <Input
                id="bathrooms"
                type="number"
                min={1}
                max={20}
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                className="max-w-xs"
                required
              />
              <p className="text-sm text-gray-500">
                {t('admin.villa.bathroomsDescription')}
              </p>
            </div>

            {/* Min Rooms */}
            <div className="space-y-2">
              <Label htmlFor="minRooms">{t('admin.villa.minRooms')}</Label>
              <Input
                id="minRooms"
                type="number"
                min={1}
                max={formData.bedrooms}
                value={formData.minRooms}
                onChange={(e) => handleInputChange('minRooms', parseInt(e.target.value))}
                className="max-w-xs"
                required
              />
              <p className="text-sm text-gray-500">
                {t('admin.villa.minRoomsDescription')}
              </p>
            </div>
          </div>

            {/* Main form submit button */}
            <div className="flex items-center justify-end space-x-4 mt-6">
              <Button
                type="submit"
                className="w-32"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

          </form>

          {/* Rooms Section */}
          <div className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Rooms</h2>
            
            {/* Current Rooms */}
            {formData.rooms && formData.rooms.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {formData.rooms.map((room, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{room.name.en}</h3>
                        <p className="text-sm text-gray-600">{room.name.th}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRoom(index)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {room.images && room.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {room.images.map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`Room ${index + 1} image ${imgIndex + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <p className="text-sm">{room.description.en}</p>
                      <p className="text-sm">{room.description.th}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Room Form */}
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomNameEn">Room Name (English)</Label>
                  <Input
                    id="roomNameEn"
                    value={roomFormData.name.en}
                    onChange={(e) => setRoomFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, en: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roomNameTh">Room Name (Thai)</Label>
                  <Input
                    id="roomNameTh"
                    value={roomFormData.name.th}
                    onChange={(e) => setRoomFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, th: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomDescEn">Description (English)</Label>
                  <textarea
                    id="roomDescEn"
                    value={roomFormData.description.en}
                    onChange={(e) => setRoomFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, en: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roomDescTh">Description (Thai)</Label>
                  <textarea
                    id="roomDescTh"
                    value={roomFormData.description.th}
                    onChange={(e) => setRoomFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, th: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="roomImages">Room Images</Label>
                <input
                  type="file"
                  id="roomImages"
                  accept="image/*"
                  multiple
                  onChange={(e) => setRoomFormData(prev => ({
                    ...prev,
                    images: Array.from(e.target.files || [])
                  }))}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload multiple images of the room. Recommended size: 1920x1080px. Max file size: 5MB per image
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding Room...' : 'Add Room'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}