import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white mt-16 full-width-element">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Mobile Apps</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Price Trends</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Post your Property</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Real Estate Investments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Builders in India</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Area Converter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Articles</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Rent Receipt</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Customer Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers with us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Request Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report a problem</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Summons/Notices</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Grievances</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Guide</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <Icon icon="solar:phone-bold" className="size-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Toll Free - 1800 41 99099</p>
                  <p className="text-xs text-gray-400">9:30 AM to 6:30 PM (Mon-Sun)</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="solar:letter-bold" className="size-5 text-gray-400 flex-shrink-0" />
                <a href="mailto:feedback@PropPuzzle.com" className="hover:text-white transition-colors">
                  feedback@PropPuzzle.com
                </a>
              </li>
            </ul>
            <div>
              <p className="text-sm font-medium mb-3">Follow Us</p>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  <Icon icon="solar:facebook-bold" className="size-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  <Icon icon="solar:twitter-bold" className="size-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  <Icon icon="solar:instagram-bold" className="size-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  <Icon icon="solar:linkedin-bold" className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>
            All trademarks are the property of their respective owners. All rights reserved - PropPuzzle Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}