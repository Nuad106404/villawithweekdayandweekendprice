import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchVillaDetails, updateVillaDetails } from '../../store/slices/villaSlice';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { villaApi } from '../../services/api';

interface BankDetails {
  bank: string;
  accountNumber: string;
  accountName: string;
}

interface FormData {
  bankDetails: BankDetails[];
}

const defaultFormData: FormData = {
  bankDetails: []
};

export default function AdminBank() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const villa = useSelector((state: RootState) => state.villa.villa);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [promptPayQR, setPromptPayQR] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (villa) {
      setFormData({
        bankDetails: villa.bankDetails || [],
      });
    }
  }, [villa]);

  useEffect(() => {
    dispatch(fetchVillaDetails() as any);
  }, [dispatch]);

  const handleAddBank = () => {
    setFormData(prev => ({
      ...prev,
      bankDetails: [
        ...prev.bankDetails,
        { bank: '', accountNumber: '', accountName: '' }
      ]
    }));
  };

  const handleRemoveBank = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.filter((_, i) => i !== index)
    }));
  };

  const handleBankDetailsChange = (index: number, field: keyof BankDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankDetails: prev.bankDetails.map((bank, i) => 
        i === index ? { ...bank, [field]: value } : bank
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update bank details using the API directly
      await villaApi.updateBankDetails(formData.bankDetails);
      // Refresh villa details to get the updated data
      await dispatch(fetchVillaDetails() as any);
      toast.success(t('admin.bank.updateSuccess'));
    } catch (error) {
      console.error('Error updating bank details:', error);
      toast.error(t('admin.bank.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptPayQR) {
      toast.error(t('admin.bank.selectQR'));
      return;
    }

    setIsSubmitting(true);
    try {
      await villaApi.uploadQRCode(promptPayQR);
      toast.success(t('admin.bank.qrUpdated'));
      await dispatch(fetchVillaDetails() as any);
      setPromptPayQR(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading QR code:', error);
      toast.error(t('admin.bank.errorUploadingQR'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('admin.bank.invalidFileType'));
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('admin.bank.fileTooLarge'));
        return;
      }
      setPromptPayQR(file);
    }
  };

  const handleDeletePromptPayQR = async () => {
    if (!window.confirm(t('admin.bank.confirmDeleteQR'))) {
      return;
    }

    setIsLoading(true);
    try {
      await villaApi.deleteQRCode();
      toast.success(t('admin.bank.qrDeleted'));
      await dispatch(fetchVillaDetails() as any);
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error(t('admin.bank.errorDeletingQR'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!villa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('admin.bank.title')}</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bank Details Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.bank.bankDetails')}</h2>
            
            {formData.bankDetails.map((bank, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveBank(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="space-y-2">
                  <Label htmlFor={`bank-${index}`}>{t('admin.bank.bankName')}</Label>
                  <Input
                    id={`bank-${index}`}
                    value={bank.bank}
                    onChange={(e) => handleBankDetailsChange(index, 'bank', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`accountNumber-${index}`}>{t('admin.bank.accountNumber')}</Label>
                  <Input
                    id={`accountNumber-${index}`}
                    value={bank.accountNumber}
                    onChange={(e) => handleBankDetailsChange(index, 'accountNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`accountName-${index}`}>{t('admin.bank.accountName')}</Label>
                  <Input
                    id={`accountName-${index}`}
                    value={bank.accountName}
                    onChange={(e) => handleBankDetailsChange(index, 'accountName', e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAddBank}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('admin.bank.addBank')}
            </Button>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </form>
        </Card>

        {/* PromptPay QR Form */}
        <Card className="p-6">
          <form onSubmit={handlePromptPaySubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.bank.promptpayQR')}</h2>
            
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="qr-code">{t('admin.bank.uploadQR')}</Label>
                <Input
                  id="qr-code"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>

              {villa?.promptPay?.qrImage && (
                <div className="relative w-full max-w-sm">
                  <img
                    src={`${villa.promptPay.qrImage}`}
                    alt="PromptPay QR"
                    className="w-full h-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={handleDeletePromptPayQR}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !promptPayQR}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.uploading')}
                </>
              ) : (
                t('admin.bank.updateQR')
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
