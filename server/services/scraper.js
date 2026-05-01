import axios from 'axios';

// Mock data for demonstration
const mockHotels = {
  'miami': [
    { company_name: 'Ocean View Resort', owner_name: 'John Smith', phone_number: '(305) 555-0101', email: 'info@oceanview.com', address: '123 Beach Ave', review_count: 245, rating: 4.5 },
    { company_name: 'Sunset Hotel Miami', owner_name: 'Maria Garcia', phone_number: '(305) 555-0102', email: 'contact@sunset-miami.com', address: '456 Ocean Dr', review_count: 189, rating: 4.3 },
    { company_name: 'Palm Beach Inn', owner_name: 'Robert Johnson', phone_number: '(305) 555-0103', email: 'reservations@palmbeach-inn.com', address: '789 Collins Ave', review_count: 156, rating: 4.1 },
    { company_name: 'Tropical Paradise Hotel', owner_name: 'Elena Rodriguez', phone_number: '(305) 555-0104', email: 'hello@tropical-paradise.com', address: '321 First St', review_count: 312, rating: 4.7 },
    { company_name: 'Downtown Boutique Hotel', owner_name: 'Michael Chen', phone_number: '(305) 555-0105', email: 'bookings@downtown-boutique.com', address: '654 5th Ave', review_count: 128, rating: 3.9 },
    { company_name: 'Beachfront Luxury Resort', owner_name: 'David Martinez', phone_number: '(305) 555-0106', email: 'concierge@beachfront-luxury.com', address: '987 Biscayne Blvd', review_count: 423, rating: 4.8 },
    { company_name: 'Heritage Hotel Group', owner_name: 'Sarah Thompson', phone_number: '(305) 555-0107', email: 'info@heritage-hotels.com', address: '159 Washington Ave', review_count: 267, rating: 4.4 },
    { company_name: 'Modern City Hotel', owner_name: 'James Wilson', phone_number: '(305) 555-0108', email: 'reservations@modern-city.com', address: '246 Flagler St', review_count: 178, rating: 4.0 }
  ],
  'newyork': [
    { company_name: 'Times Square Grand Hotel', owner_name: 'Patricia Lee', phone_number: '(212) 555-0201', email: 'info@times-square-grand.com', address: '123 42nd St', review_count: 534, rating: 4.6 },
    { company_name: 'Manhattan Modern Hotel', owner_name: 'Andrew Jackson', phone_number: '(212) 555-0202', email: 'reservations@manhattan-modern.com', address: '456 Park Ave', review_count: 298, rating: 4.4 },
    { company_name: 'Brooklyn Bridge View Hotel', owner_name: 'Lisa Anderson', phone_number: '(212) 555-0203', email: 'contact@brooklyn-bridge.com', address: '789 Front St', review_count: 267, rating: 4.5 },
    { company_name: 'Upper West Side Inn', owner_name: 'Donald White', phone_number: '(212) 555-0204', email: 'reservations@upwest-inn.com', address: '321 Columbus Ave', review_count: 145, rating: 4.1 },
    { company_name: 'Fifth Avenue Luxury', owner_name: 'Jennifer Brown', phone_number: '(212) 555-0205', email: 'concierge@fifth-avenue.com', address: '654 5th Ave', review_count: 389, rating: 4.7 },
    { company_name: 'Downtown Manhattan Boutique', owner_name: 'Christopher Davis', phone_number: '(212) 555-0206', email: 'hello@downtown-boutique.com', address: '987 Broadway', review_count: 156, rating: 3.8 },
    { company_name: 'Midtown Comfort Hotel', owner_name: 'Nancy Miller', phone_number: '(212) 555-0207', email: 'bookings@midtown-comfort.com', address: '159 Madison Ave', review_count: 234, rating: 4.2 },
    { company_name: 'Harlem Heritage Hotel', owner_name: 'George Taylor', phone_number: '(212) 555-0208', email: 'info@harlem-heritage.com', address: '246 Malcolm X Blvd', review_count: 189, rating: 4.3 }
  ],
  'losangeles': [
    { company_name: 'Hollywood Star Hotel', owner_name: 'Victoria Evans', phone_number: '(310) 555-0301', email: 'info@hollywood-star.com', address: '123 Hollywood Blvd', review_count: 412, rating: 4.5 },
    { company_name: 'Santa Monica Beach Resort', owner_name: 'Kevin Harris', phone_number: '(310) 555-0302', email: 'reservations@santa-monica.com', address: '456 Pico Blvd', review_count: 367, rating: 4.6 },
    { company_name: 'Downtown LA Modern', owner_name: 'Rebecca Clark', phone_number: '(310) 555-0303', email: 'contact@downtown-modern.com', address: '789 Figueroa St', review_count: 223, rating: 4.0 },
    { company_name: 'Sunset Strip Luxury', owner_name: 'Daniel Lopez', phone_number: '(310) 555-0304', email: 'concierge@sunset-luxury.com', address: '321 Sunset Blvd', review_count: 298, rating: 4.7 },
    { company_name: 'Beverly Hills Iconic Hotel', owner_name: 'Susan Rodriguez', phone_number: '(310) 555-0305', email: 'reservations@beverly-iconic.com', address: '654 Wilshire Blvd', review_count: 445, rating: 4.8 },
    { company_name: 'Venice Beach Inn', owner_name: 'Mark Thompson', phone_number: '(310) 555-0306', email: 'info@venice-beach-inn.com', address: '987 Ocean Front Walk', review_count: 178, rating: 4.1 },
    { company_name: 'Griffith Park View Hotel', owner_name: 'Emma Martinez', phone_number: '(310) 555-0307', email: 'bookings@griffith-view.com', address: '159 Los Feliz Blvd', review_count: 156, rating: 3.9 },
    { company_name: 'Pasadena Heritage Hotel', owner_name: 'Thomas King', phone_number: '(310) 555-0308', email: 'hello@pasadena-heritage.com', address: '246 S Orange Grove Blvd', review_count: 267, rating: 4.4 }
  ]
};

const mockPropertyManagers = {
  'miami': [
    { company_name: 'Miami Property Management Group', owner_name: 'Carlos Sanchez', phone_number: '(305) 555-1001', email: 'info@miamipm.com', address: '123 Brickell Ave', review_count: 156, rating: 4.5 },
    { company_name: 'Coastal Properties Miami', owner_name: 'Anna Martinez', phone_number: '(305) 555-1002', email: 'contact@coastal-pm.com', address: '456 Coral Way', review_count: 189, rating: 4.3 },
    { company_name: 'Sunshine Realty Management', owner_name: 'Miguel Flores', phone_number: '(305) 555-1003', email: 'info@sunshine-realty.com', address: '789 Miracle Mile', review_count: 267, rating: 4.6 },
    { company_name: 'Atlantic View Properties', owner_name: 'Isabella Garcia', phone_number: '(305) 555-1004', email: 'reservations@atlantic-view.com', address: '321 Alton Rd', review_count: 134, rating: 3.9 },
    { company_name: 'Miami Beach Residential', owner_name: 'Fernando Lopez', phone_number: '(305) 555-1005', email: 'hello@miami-beach-res.com', address: '654 Washington Ave', review_count: 211, rating: 4.4 }
  ],
  'newyork': [
    { company_name: 'Manhattan Property Management', owner_name: 'Gregory Adams', phone_number: '(212) 555-1101', email: 'info@manhattan-pm.com', address: '123 Madison Ave', review_count: 234, rating: 4.5 },
    { company_name: 'Brooklyn Residential Management', owner_name: 'Sophia Brown', phone_number: '(212) 555-1102', email: 'contact@brooklyn-res.com', address: '456 Atlantic Ave', review_count: 178, rating: 4.2 },
    { company_name: 'New York Estate Properties', owner_name: 'Victor White', phone_number: '(212) 555-1103', email: 'reservations@ny-estate.com', address: '789 Park Ave', review_count: 312, rating: 4.7 },
    { company_name: 'Upper Manhattan Realty', owner_name: 'Rachel Davis', phone_number: '(212) 555-1104', email: 'hello@upper-manhattan.com', address: '321 Broadway', review_count: 145, rating: 4.0 },
    { company_name: 'NYC Landmark Properties', owner_name: 'Theodore Johnson', phone_number: '(212) 555-1105', email: 'info@nyc-landmark.com', address: '654 5th Ave', review_count: 267, rating: 4.6 }
  ],
  'losangeles': [
    { company_name: 'Los Angeles Property Solutions', owner_name: 'Olivia Martinez', phone_number: '(310) 555-1201', email: 'info@la-property.com', address: '123 Wilshire Blvd', review_count: 189, rating: 4.4 },
    { company_name: 'Hollywood Residential Management', owner_name: 'Nathan Harris', phone_number: '(310) 555-1202', email: 'contact@hollywood-res.com', address: '456 Hollywood Blvd', review_count: 156, rating: 4.1 },
    { company_name: 'California Realty Advisors', owner_name: 'Diana Allen', phone_number: '(310) 555-1203', email: 'reservations@ca-realty.com', address: '789 Santa Monica Blvd', review_count: 234, rating: 4.5 },
    { company_name: 'Sunset Properties LA', owner_name: 'Lucas Garcia', phone_number: '(310) 555-1204', email: 'hello@sunset-pm.com', address: '321 Sunset Blvd', review_count: 178, rating: 4.2 },
    { company_name: 'Pacific Coast Management', owner_name: 'Emma Wilson', phone_number: '(310) 555-1205', email: 'info@pacific-coast.com', address: '654 Ocean Blvd', review_count: 267, rating: 4.6 }
  ]
};

export async function scrapeGoogleMaps(city, industry, minReviews = 3) {
  try {
    // For demo purposes, use mock data
    // In production, integrate with Google Maps API or Puppeteer for real scraping

    const cityLower = city.toLowerCase();
    let mockData = [];

    if (industry.toLowerCase().includes('hotel')) {
      mockData = mockHotels[cityLower] || mockHotels['miami'];
    } else if (industry.toLowerCase().includes('property') || industry.toLowerCase().includes('manager')) {
      mockData = mockPropertyManagers[cityLower] || mockPropertyManagers['miami'];
    }

    // Filter by minimum reviews
    const filtered = mockData.filter(item => item.review_count >= minReviews);

    // Add Google Maps URL (mock)
    const leads = filtered.map(item => ({
      ...item,
      google_maps_url: `https://www.google.com/maps/search/${encodeURIComponent(item.company_name + ' ' + city)}`
    }));

    console.log(`📍 Scraped ${leads.length} leads for ${city}, ${industry}`);
    return leads;

  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}

// Real Google Maps API Integration (requires API key)
export async function scrapeGoogleMapsAPI(city, industry, minReviews = 3, apiKey) {
  if (!apiKey) {
    throw new Error('Google Maps API key required');
  }

  try {
    const searchQuery = `${industry} in ${city}`;

    // Using Google Maps API Place Search endpoint
    // This would require a valid API key and proper setup
    // For now, fall back to mock data

    return await scrapeGoogleMaps(city, industry, minReviews);
  } catch (error) {
    console.error('Google Maps API error:', error);
    throw error;
  }
}
