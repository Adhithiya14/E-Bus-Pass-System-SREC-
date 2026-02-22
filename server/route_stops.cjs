/**
 * Comprehensive mapping of bus route stops for Leaflet Map Feature
 * Format: { [route_number]: [{ name, lat, lng, order }, ...] }
 */

const routeStopsData = {
    "1": [
        { name: "Singanallur", lat: 11.0028, lng: 77.0195, order: 1 },
        { name: "Varadharajapuuram", lat: 11.0116, lng: 77.0142, order: 2 },
        { name: "ESI", lat: 11.0150, lng: 77.0050, order: 3 },
        { name: "Lions", lat: 11.0180, lng: 77.0000, order: 4 },
        { name: "Ramanujam Nagar", lat: 11.0250, lng: 76.9950, order: 5 },
        { name: "Manis theatre", lat: 11.0280, lng: 76.9850, order: 6 },
        { name: "Gandhimanagar", lat: 11.0350, lng: 76.9950, order: 7 },
        { name: "VOC Nagar", lat: 11.0450, lng: 76.9850, order: 8 },
        { name: "FC Godown", lat: 11.0550, lng: 76.9750, order: 9 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 10 }
    ],
    "2": [
        { name: "Chinniampalayam", lat: 11.0500, lng: 77.0700, order: 1 },
        { name: "R.G.Pudur", lat: 11.0550, lng: 77.0600, order: 2 },
        { name: "Thottipalayam pirivu", lat: 11.0520, lng: 77.0500, order: 3 },
        { name: "SITRA", lat: 11.0450, lng: 77.0400, order: 4 },
        { name: "Nehru Nagar", lat: 11.0480, lng: 77.0250, order: 5 },
        { name: "NGP", lat: 11.0550, lng: 77.0150, order: 6 },
        { name: "Kalapatti", lat: 11.0700, lng: 77.0100, order: 7 },
        { name: "VilanKuruchi", lat: 11.0750, lng: 76.9900, order: 8 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 9 }
    ],
    "3": [
        { name: "Omni Bus Stop", lat: 11.0200, lng: 76.9650, order: 1 },
        { name: "Lakshmi puram", lat: 11.0250, lng: 76.9750, order: 2 },
        { name: "Ganapathy", lat: 11.0350, lng: 76.9850, order: 3 },
        { name: "Sanganoor", lat: 11.0450, lng: 76.9750, order: 4 },
        { name: "Kannappa Nagar", lat: 11.0550, lng: 76.9650, order: 5 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 6 }
    ],
    "4": [
        { name: "Nava India", lat: 11.0252, lng: 77.0016, order: 1 },
        { name: "ESSO Bunk", lat: 11.0180, lng: 77.0050, order: 2 },
        { name: "Krishnammal college", lat: 11.0220, lng: 77.0150, order: 3 },
        { name: "Tidel Park", lat: 11.0245, lng: 77.0345, order: 4 },
        { name: "Thanneer pandal", lat: 11.0445, lng: 77.0445, order: 5 },
        { name: "Bharathi Nagar", lat: 11.0550, lng: 77.0350, order: 6 },
        { name: "Cheran Ma Nagar", lat: 11.0650, lng: 77.0250, order: 7 },
        { name: "Water Tank", lat: 11.0750, lng: 77.0150, order: 8 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 9 }
    ],
    "5": [
        { name: "Peelamedu", lat: 11.0250, lng: 77.0150, order: 1 },
        { name: "Anna Nagar", lat: 11.0300, lng: 77.0050, order: 2 },
        { name: "GRG School", lat: 11.0350, lng: 76.9950, order: 3 },
        { name: "Amman Kovil", lat: 11.0450, lng: 76.9850, order: 4 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 5 }
    ],
    "6": [
        { name: "Sri Ramakrishna Hospital", lat: 11.0220, lng: 76.9800, order: 1 },
        { name: "Lakshmi Mills", lat: 11.0118, lng: 76.9859, order: 2 },
        { name: "GKNM Hospital", lat: 11.0150, lng: 76.9700, order: 3 },
        { name: "Women’s Polytechnic", lat: 11.0155, lng: 76.9755, order: 4 },
        { name: "Gandhipuram", lat: 11.0183, lng: 76.9632, order: 5 },
        { name: "Cheran Nagar", lat: 11.0555, lng: 76.9355, order: 6 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 7 }
    ],
    "7": [
        { name: "VKK Menon Road", lat: 11.0150, lng: 76.9550, order: 1 },
        { name: "Kalyan", lat: 11.0180, lng: 76.9580, order: 2 },
        { name: "Sivananda Colony", lat: 11.0335, lng: 76.9535, order: 3 },
        { name: "Pudhuppalam", lat: 11.0450, lng: 76.9500, order: 4 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 5 }
    ],
    "8": [
        { name: "Textool", lat: 11.0350, lng: 76.9700, order: 1 },
        { name: "CMS", lat: 11.0500, lng: 76.9800, order: 2 },
        { name: "Sivanandapuram", lat: 11.0650, lng: 76.9900, order: 3 },
        { name: "Saravanampatti", lat: 11.0800, lng: 76.9950, order: 4 },
        { name: "Sunnambukalvai", lat: 11.0900, lng: 76.9850, order: 5 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 6 }
    ],
    "9": [
        { name: "Power House", lat: 11.0285, lng: 76.9555, order: 1 },
        { name: "Alegesan Road", lat: 11.0350, lng: 76.9450, order: 2 },
        { name: "Eru Company", lat: 11.0450, lng: 76.9350, order: 3 },
        { name: "Teacher Colony", lat: 11.0650, lng: 76.9250, order: 4 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 5 }
    ],
    "10": [
        { name: "Chettipalaym", lat: 10.9200, lng: 77.0100, order: 1 },
        { name: "LIC Colony", lat: 10.9600, lng: 76.9800, order: 2 },
        { name: "ChettiVeedi", lat: 10.9950, lng: 76.9650, order: 3 },
        { name: "Theppakulam", lat: 11.0050, lng: 76.9600, order: 4 },
        { name: "Best Bakery", lat: 11.0200, lng: 76.9550, order: 5 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 6 }
    ],
    "11": [
        { name: "Marudhamalai", lat: 11.0250, lng: 76.9000, order: 1 },
        { name: "Navavoor pirivu", lat: 11.0280, lng: 76.9150, order: 2 },
        { name: "Anna Nagar", lat: 11.0350, lng: 76.9350, order: 3 },
        { name: "KNG pudur", lat: 11.0550, lng: 76.9450, order: 4 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 5 }
    ],
    "12": [
        { name: "Vadavalli", lat: 11.0200, lng: 76.9150, order: 1 },
        { name: "Mullai Nagar", lat: 11.0250, lng: 76.9250, order: 2 },
        { name: "Perumal kovil", lat: 11.0350, lng: 76.9350, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "13": [
        { name: "Venkitapuram", lat: 11.0250, lng: 76.9450, order: 1 },
        { name: "Kovilmedu", lat: 11.0350, lng: 76.9350, order: 2 },
        { name: "Sivaji Colony", lat: 11.0450, lng: 76.9300, order: 3 },
        { name: "Sakthi Nagar", lat: 11.0650, lng: 76.9350, order: 4 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 5 }
    ],
    "14": [
        { name: "R.S. Puram", lat: 11.0050, lng: 76.9500, order: 1 },
        { name: "Lawley Road", lat: 11.0150, lng: 76.9450, order: 2 },
        { name: "Kavundampalayam", lat: 11.0455, lng: 76.9455, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "15": [
        { name: "Thondamuthur", lat: 11.0100, lng: 76.8500, order: 1 },
        { name: "P.N. Pudur", lat: 11.0150, lng: 76.9250, order: 2 },
        { name: "Edayarpalayam", lat: 11.0350, lng: 76.9350, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "16": [
        { name: "TVS Bus stop", lat: 11.0150, lng: 76.9150, order: 1 },
        { name: "Siva Sakthi Theatre", lat: 11.0350, lng: 76.9350, order: 2 },
        { name: "Goundar Mills", lat: 11.0550, lng: 76.9450, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "17": [
        { name: "LMW", lat: 11.0450, lng: 76.9450, order: 1 },
        { name: "NSN Palayam", lat: 11.0650, lng: 76.9550, order: 2 },
        { name: "NGGO Colony", lat: 11.0850, lng: 76.9450, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "18": [
        { name: "Veerapandi Pirivu", lat: 11.0750, lng: 76.9650, order: 1 },
        { name: "Pricol", lat: 11.0850, lng: 76.9750, order: 2 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 3 }
    ],
    "19": [
        { name: "Annur", lat: 11.2300, lng: 77.1000, order: 1 },
        { name: "Ganeshapuram", lat: 11.1500, lng: 77.0500, order: 2 },
        { name: "KovilPalayam", lat: 11.1000, lng: 77.0200, order: 3 },
        { name: "Idigarai", lat: 11.0700, lng: 76.9600, order: 4 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 5 }
    ],
    "20": [
        { name: "Mettupalayam", lat: 11.3000, lng: 76.9300, order: 1 },
        { name: "Annai Velankanni", lat: 11.2000, lng: 76.9400, order: 2 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 3 }
    ],
    "21": [
        { name: "Karamadai", lat: 11.2400, lng: 76.9600, order: 1 },
        { name: "Gandhi Nagar", lat: 11.1500, lng: 76.9500, order: 2 },
        { name: "Jothipuram", lat: 11.1000, lng: 76.9300, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "22": [
        { name: "Karamadai", lat: 11.2400, lng: 76.9600, order: 1 },
        { name: "Mathampalayam", lat: 11.1500, lng: 76.9400, order: 2 },
        { name: "Press colony", lat: 11.1000, lng: 76.9350, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "23": [
        { name: "Vannan Kovil", lat: 11.1200, lng: 76.9500, order: 1 },
        { name: "Perianaicken Palayam", lat: 11.1300, lng: 76.9400, order: 2 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 3 }
    ],
    "24": [
        { name: "Sowripalayam", lat: 11.0050, lng: 77.0050, order: 1 },
        { name: "Puliyakulam", lat: 11.0100, lng: 76.9850, order: 2 },
        { name: "Thomas Park", lat: 11.0150, lng: 76.9750, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "25": [
        { name: "Sundakkamuthur", lat: 10.9700, lng: 76.9100, order: 1 },
        { name: "Kuniamuthur", lat: 10.9800, lng: 76.9500, order: 2 },
        { name: "Athupalam", lat: 11.0000, lng: 76.9600, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "26": [
        { name: "Jayendra School", lat: 11.0100, lng: 77.0300, order: 1 },
        { name: "Singanallur", lat: 11.0028, lng: 77.0195, order: 2 },
        { name: "Sowripalayam", lat: 11.0050, lng: 77.0050, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "27": [
        { name: "Sulur", lat: 11.0250, lng: 77.1250, order: 1 },
        { name: "Ondhipudur", lat: 11.0150, lng: 77.0550, order: 2 },
        { name: "Sungam", lat: 11.0050, lng: 76.9850, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ],
    "28": [
        { name: "Premier Mills", lat: 10.9200, lng: 77.0000, order: 1 },
        { name: "Podanur", lat: 10.9700, lng: 76.9800, order: 2 },
        { name: "Ukkadam", lat: 11.0000, lng: 76.9600, order: 3 },
        { name: "G.N.Mills", lat: 11.0500, lng: 76.9400, order: 4 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 5 }
    ],
    "29": [
        { name: "Marakkadai", lat: 11.0000, lng: 76.9700, order: 1 },
        { name: "Flower Market", lat: 11.0100, lng: 76.9550, order: 2 },
        { name: "Thudiyalur", lat: 11.0550, lng: 76.9450, order: 3 },
        { name: "SREC Campus", lat: 11.0965, lng: 76.9248, order: 4 }
    ]
};

module.exports = routeStopsData;
