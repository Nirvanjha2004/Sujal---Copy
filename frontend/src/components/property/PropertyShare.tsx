import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertyShareProps {
  propertyId: number;
  propertyTitle: string;
  propertyUrl?: string;
}

export function PropertyShare({ propertyId, propertyTitle, propertyUrl }: PropertyShareProps) {
  const [copied, setCopied] = useState(false);
  
  const currentUrl = propertyUrl || `${window.location.origin}/property/${propertyId}`;
  
  const shareData = {
    title: propertyTitle,
    text: `Check out this property: ${propertyTitle}`,
    url: currentUrl,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(propertyTitle);
    const encodedText = encodeURIComponent(`Check out this property: ${propertyTitle}`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="solar:share-bold" className="size-5" />
          Share Property
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Copy Link */}
        <div className="space-y-2">
          <Label htmlFor="property-url">Property Link</Label>
          <div className="flex gap-2">
            <Input
              id="property-url"
              value={currentUrl}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className={copied ? "bg-green-50 border-green-200" : ""}
            >
              <Icon 
                icon={copied ? "solar:check-bold" : "solar:copy-bold"} 
                className="size-4 mr-2" 
              />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Native Share (if supported) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="w-full"
          >
            <Icon icon="solar:share-bold" className="size-4 mr-2" />
            Share via Device
          </Button>
        )}

        {/* Social Media Sharing */}
        <div className="space-y-3">
          <Label>Share on Social Media</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => handleSocialShare('whatsapp')}
              className="flex items-center gap-2 text-green-600 hover:bg-green-50"
            >
              <Icon icon="solar:whatsapp-bold" className="size-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('facebook')}
              className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
            >
              <Icon icon="solar:facebook-bold" className="size-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('twitter')}
              className="flex items-center gap-2 text-sky-600 hover:bg-sky-50"
            >
              <Icon icon="solar:twitter-bold" className="size-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('linkedin')}
              className="flex items-center gap-2 text-blue-700 hover:bg-blue-50"
            >
              <Icon icon="solar:linkedin-bold" className="size-4" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('telegram')}
              className="flex items-center gap-2 text-blue-500 hover:bg-blue-50"
            >
              <Icon icon="solar:telegram-bold" className="size-4" />
              Telegram
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('email')}
              className="flex items-center gap-2 text-gray-600 hover:bg-gray-50"
            >
              <Icon icon="solar:letter-bold" className="size-4" />
              Email
            </Button>
          </div>
        </div>

        {/* QR Code Option */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // TODO: Implement QR code generation
              console.log('Generate QR code for:', currentUrl);
            }}
          >
            <Icon icon="solar:qr-code-bold" className="size-4 mr-2" />
            Generate QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}