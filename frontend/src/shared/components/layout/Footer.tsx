import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white mt-16 full-width-element">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Mobile Apps</a></li>
              <li><a href="#" className="hover:text-white">Our Services</a></li>
              <li><a href="#" className="hover:text-white">Price Trends</a></li>
              <li><a href="#" className="hover:text-white">Post your Property</a></li>
              <li><a href="#" className="hover:text-white">Real Estate Investments</a></li>
              <li><a href="#" className="hover:text-white">Builders in India</a></li>
              <li><a href="#" className="hover:text-white">Area Converter</a></li>
              <li><a href="#" className="hover:text-white">Articles</a></li>
              <li><a href="#" className="hover:text-white">Rent Receipt</a></li>
              <li><a href="#" className="hover:text-white">Customer Service</a></li>
              <li><a href="#" className="hover:text-white">Sitemap</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">About us</a></li>
              <li><a href="#" className="hover:text-white">Contact us</a></li>
              <li><a href="#" className="hover:text-white">Careers with us</a></li>
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white">Request Info</a></li>
              <li><a href="#" className="hover:text-white">Feedback</a></li>
              <li><a href="#" className="hover:text-white">Report a problem</a></li>
              <li><a href="#" className="hover:text-white">Testimonials</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Summons/Notices</a></li>
              <li><a href="#" className="hover:text-white">Grievances</a></li>
              <li><a href="#" className="hover:text-white">Safety Guide</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Our Partners</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Naukri.com - Jobs in India</a></li>
              <li><a href="#" className="hover:text-white">Naukrigulf.com - Jobs in middle east</a></li>
              <li><a href="#" className="hover:text-white">Jeevansathi.com - Matrimony</a></li>
              <li><a href="#" className="hover:text-white">PropPuzzle.com - Professional Networking</a></li>
              <li><a href="#" className="hover:text-white">Policybazaar.com - Education</a></li>
              <li><a href="#" className="hover:text-white">Career Info</a></li>
              <li><a href="#" className="hover:text-white">Policybazaar.com - Insurance BFSI</a></li>
              <li><a href="#" className="hover:text-white">Paisabazaar.com</a></li>
              <li><a href="#" className="hover:text-white">Ambitionbox.com</a></li>
              <li><a href="#" className="hover:text-white">Firstnaukri.com - A jobsite for campus hiring</a></li>
              <li><a href="#" className="hover:text-white">Jobhai.com - Find jobs here! You</a></li>
              <li><a href="#" className="hover:text-white">Techmahindra.com - Tech news on the go</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Toll Free - 1800 41 99099</li>
              <li>9:30 AM to 6:30 PM (Mon-Sun)</li>
              <li>Email - feedback@PropPuzzle.com</li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Icon icon="solar:facebook-bold" className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Icon icon="solar:twitter-bold" className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Icon icon="solar:instagram-bold" className="size-4" />
              </Button>
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