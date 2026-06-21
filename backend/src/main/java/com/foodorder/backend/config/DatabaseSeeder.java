package com.foodorder.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.foodorder.backend.model.MenuItem;
import com.foodorder.backend.model.Restaurant;
import com.foodorder.backend.repository.MenuItemRepository;
import com.foodorder.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final Cloudinary cloudinary;

    // --- Verified Unsplash image URLs for each dish name ---
    // Each URL is hand-picked to show the correct dish.
    private static final Map<String, String> DISH_IMAGE_MAP = new LinkedHashMap<>();

    static {
        // Veg items
        DISH_IMAGE_MAP.put("Paneer Butter Masala",   "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Veg Spring Rolls",        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Dal Makhani",             "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Gulab Jamun",             "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop&q=80");
        DISH_IMAGE_MAP.put("Masala Chaas",            "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=500&q=80");

        // Non-veg items
        DISH_IMAGE_MAP.put("Butter Chicken",          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Chicken Tikka Kebab",     "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Soya Chaap Masala",       "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Garlic Naan",             "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Chocolate Brownie",       "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Fresh Lime Soda",         "https://images.unsplash.com/photo-1437418747212-4d5a90996082?auto=format&fit=crop&w=500&q=80");

        // Fast-food items
        DISH_IMAGE_MAP.put("Double Cheese Burger",    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Pepperoni Pizza",         "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Peri Peri Fries",         "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80");
        DISH_IMAGE_MAP.put("Oreo Milkshake",          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80");
    }

    // Unique restaurant cover images: 5 per type (veg/non-veg/fast-food) — total 15 unique covers
    private static final String[] VEG_RESTAURANT_COVERS = {
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",  // colorful veg salad
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=700&q=80",  // veg meal spread
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=700&q=80",  // fresh veg bowl
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=700&q=80",  // healthy veg plate
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=700&q=80"   // veg thali style
    };
    private static final String[] NON_VEG_RESTAURANT_COVERS = {
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80",  // grilled chicken
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80",  // meat spread
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",     // BBQ grill
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80",     // kebabs
        "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=700&q=80"   // non-veg feast
    };
    private static final String[] FAST_FOOD_RESTAURANT_COVERS = {
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",  // pizza
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",  // burger
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80",  // fries
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=700&q=80",     // fast food meal
        "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=700&q=80"      // fried chicken
    };

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        long currentCount = restaurantRepository.count();
        if (currentCount < 50) {
            int toAdd = (int) (50 - currentCount);
            log.info("Current restaurant count is {}. Seeding {} new restaurants...", currentCount, toAdd);
            seedNewRestaurants(toAdd, currentCount);
        } else {
            log.info("Database already has {} restaurants. Skipping new restaurant seeding.", currentCount);
        }

        // Always run image updates to verify and map Cloudinary images to existing records
        updateMissingImages();
    }

    private void seedNewRestaurants(int toAdd, long currentCount) {
        String[] prefixes = {"Royal", "Golden", "Spice", "Tandoori", "Grand", "Urban", "Vintage", "Happy", "Sweet", "Hot",
                             "Fresh", "Classic", "Deluxe", "Mega", "Magic", "Crazy", "Wild", "Little", "Desi", "Delhi"};
        String[] bodies   = {"Biryani", "Pizza", "Burger", "Curry", "Sushi", "Noodle", "Wok", "Salad", "Sandwich", "Dessert",
                             "Taco", "Pasta", "Kebab", "Chaat", "Dosa", "Momo", "Shake", "Coffee", "Grill", "Bake"};
        String[] suffixes = {"Hub", "House", "Bistro", "Cafe", "Palace", "Kitchen", "Express", "Station", "Corner", "Garden",
                             "Lounge", "Spot", "World", "Zone", "Junction", "Delight", "Point", "Bazaar", "Treats", "Studio"};

        String[] locations = {
            "Connaught Place, New Delhi", "Hauz Khas, New Delhi", "DLF Cyber City, Gurgaon",
            "Sector 62, Noida", "Indiranagar, Bangalore", "Koramangala, Bangalore",
            "Bandra, Mumbai", "Juhu, Mumbai", "Salt Lake, Kolkata", "Gachibowli, Hyderabad"
        };

        for (int i = 0; i < toAdd; i++) {
            int seed = (int) (currentCount + i);
            String name = prefixes[seed % prefixes.length] + " " + bodies[(seed / 2) % bodies.length] + " " + suffixes[(seed / 3) % suffixes.length];
            if (i > 0 && i % 20 == 0) {
                name += " " + (seed + 1);
            }

            String desc;
            String type;
            if (seed % 3 == 0) {
                type = "veg";
                desc = "Pure Veg. Fresh green healthy salads, traditional paneer delicacies, and organic vegetarian dishes.";
            } else if (seed % 3 == 1) {
                type = "non-veg";
                desc = "Non-Veg. Signature chicken biryanis, hot mutton seekh kebabs, spicy chaap, and authentic non-vegetarian main courses.";
            } else {
                type = "fast-food";
                desc = "Fast Food. Sizzling loaded cheese burgers, hand-tossed personal pizzas, golden fries, and quick bite snacks.";
            }

            Restaurant restaurant = new Restaurant();
            restaurant.setName(name);
            restaurant.setDescription(desc);
            restaurant.setLocation(locations[seed % locations.length]);
            restaurant.setIsActive(true);
            restaurant.setImageUrl(""); // Will be updated by updateMissingImages()

            restaurant = restaurantRepository.save(restaurant);
            seedMenuItems(restaurant, type);
        }
    }

    private void seedMenuItems(Restaurant restaurant, String type) {
        List<MenuItem> items = new ArrayList<>();

        if ("veg".equals(type)) {
            items.add(createMenuItem(restaurant, "Paneer Butter Masala", "Cubes of paneer cooked in a rich, creamy, and mildly sweet butter tomato gravy.", new BigDecimal("250.00"), "Main Course", true));
            items.add(createMenuItem(restaurant, "Veg Spring Rolls",     "Crispy deep-fried rolls filled with seasoned mixed vegetables and served with sweet chili sauce.", new BigDecimal("150.00"), "Appetizer", true));
            items.add(createMenuItem(restaurant, "Dal Makhani",           "Black lentils slow-cooked overnight with butter and cream for an authentic rich flavor.", new BigDecimal("220.00"), "Main Course", true));
            items.add(createMenuItem(restaurant, "Gulab Jamun",           "Two soft, syrup-soaked milk solid dumplings flavored with cardamom.", new BigDecimal("80.00"), "Dessert", true));
            items.add(createMenuItem(restaurant, "Masala Chaas",          "Refreshing spiced buttermilk blended with fresh coriander, cumin, and mint.", new BigDecimal("50.00"), "Beverage", true));
        } else if ("non-veg".equals(type)) {
            items.add(createMenuItem(restaurant, "Butter Chicken",        "Tender tandoori grilled chicken chunks simmered in a velvety smooth tomato-butter gravy.", new BigDecimal("320.00"), "Main Course", false));
            items.add(createMenuItem(restaurant, "Chicken Tikka Kebab",   "Boneless chicken marinated in spiced yogurt and grilled to perfection in a tandoor.", new BigDecimal("260.00"), "Appetizer", false));
            items.add(createMenuItem(restaurant, "Soya Chaap Masala",     "Roasted soya chaap chops cooked in a thick spicy onion-tomato gravy.", new BigDecimal("190.00"), "Main Course", true));
            items.add(createMenuItem(restaurant, "Garlic Naan",           "Leavened flatbread brushed with melted butter and fresh minced garlic.", new BigDecimal("60.00"), "Bread", true));
            items.add(createMenuItem(restaurant, "Chocolate Brownie",     "Warm fudge chocolate brownie served with a drizzle of chocolate sauce.", new BigDecimal("110.00"), "Dessert", true));
            items.add(createMenuItem(restaurant, "Fresh Lime Soda",       "Thirst-quenching carbonated water mixed with fresh lime juice, sweet and salty.", new BigDecimal("70.00"), "Beverage", true));
        } else { // fast-food
            items.add(createMenuItem(restaurant, "Double Cheese Burger",  "Juicy vegetable patty topped with double cheddar cheese, lettuce, and house sauce.", new BigDecimal("140.00"), "Main Course", true));
            items.add(createMenuItem(restaurant, "Pepperoni Pizza",       "Classic hand-tossed pizza topped with rich pizza sauce, mozzarella cheese, and chicken pepperoni.", new BigDecimal("290.00"), "Main Course", false));
            items.add(createMenuItem(restaurant, "Peri Peri Fries",       "Crispy golden French fries tossed in a spicy peri peri seasoning mix.", new BigDecimal("90.00"), "Appetizer", true));
            items.add(createMenuItem(restaurant, "Oreo Milkshake",        "Creamy vanilla ice cream blended with crushed Oreo cookies and milk, topped with whipped cream.", new BigDecimal("130.00"), "Beverage", true));
        }

        menuItemRepository.saveAll(items);
    }

    private MenuItem createMenuItem(Restaurant restaurant, String name, String description, BigDecimal price, String category, boolean isVeg) {
        MenuItem item = new MenuItem();
        item.setRestaurant(restaurant);
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setIsVeg(isVeg);
        item.setIsAvailable(true);
        item.setImageUrl(""); // Will be updated by updateMissingImages()
        return item;
    }

    @Transactional
    public void updateMissingImages() {
        log.info("Updating missing restaurant and menu item images from Cloudinary...");

        // ---- 1. Restaurant cover images ----
        // Build Cloudinary URLs for all restaurant-type covers (5 per type)
        String[] vegCloudUrls      = new String[VEG_RESTAURANT_COVERS.length];
        String[] nonVegCloudUrls   = new String[NON_VEG_RESTAURANT_COVERS.length];
        String[] fastFoodCloudUrls = new String[FAST_FOOD_RESTAURANT_COVERS.length];

        for (int i = 0; i < VEG_RESTAURANT_COVERS.length; i++) {
            vegCloudUrls[i] = getOrCreateCloudinaryUrl(
                "food_ordering_system/restaurants/veg_" + i, VEG_RESTAURANT_COVERS[i]);
        }
        for (int i = 0; i < NON_VEG_RESTAURANT_COVERS.length; i++) {
            nonVegCloudUrls[i] = getOrCreateCloudinaryUrl(
                "food_ordering_system/restaurants/non_veg_" + i, NON_VEG_RESTAURANT_COVERS[i]);
        }
        for (int i = 0; i < FAST_FOOD_RESTAURANT_COVERS.length; i++) {
            fastFoodCloudUrls[i] = getOrCreateCloudinaryUrl(
                "food_ordering_system/restaurants/fast_food_" + i, FAST_FOOD_RESTAURANT_COVERS[i]);
        }

        // Assign unique cover image to each restaurant (cycle through the 5 options per type)
        // Also overwrite raw Unsplash URLs that were set as fallback in previous runs
        int vegIdx = 0, nonVegIdx = 0, fastFoodIdx = 0;
        List<Restaurant> restaurants = restaurantRepository.findAll();
        for (Restaurant r : restaurants) {
            String existingUrl = r.getImageUrl();
            boolean needsUpdate = existingUrl == null || existingUrl.isEmpty() || existingUrl.contains("unsplash.com");
            if (needsUpdate) {
                String desc = r.getDescription() != null ? r.getDescription().toLowerCase() : "";
                String url;
                if (desc.contains("pure veg")) {
                    url = vegCloudUrls[vegIdx % vegCloudUrls.length];
                    vegIdx++;
                } else if (desc.contains("non-veg")) {
                    url = nonVegCloudUrls[nonVegIdx % nonVegCloudUrls.length];
                    nonVegIdx++;
                } else {
                    url = fastFoodCloudUrls[fastFoodIdx % fastFoodCloudUrls.length];
                    fastFoodIdx++;
                }
                r.setImageUrl(url);
                restaurantRepository.save(r);
            }
        }

        // ---- 2. Menu item images (name-to-URL, each with a unique Cloudinary public_id) ----
        Map<String, String> resolvedDishUrls = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : DISH_IMAGE_MAP.entrySet()) {
            String cleanName = entry.getKey().toLowerCase().replaceAll("[^a-z0-9]+", "_");
            String publicId  = "food_ordering_system/dishes/" + cleanName;
            String url       = getOrCreateCloudinaryUrl(publicId, entry.getValue());
            resolvedDishUrls.put(entry.getKey(), url);
            log.info("Dish image resolved: {} -> {}", entry.getKey(), url);
        }

        List<MenuItem> items = menuItemRepository.findAll();
        int updated = 0;
        for (MenuItem item : items) {
            // Overwrite if empty OR if it's still a raw Unsplash URL (fallback from previous run)
            String existing = item.getImageUrl();
            boolean needsUpdate = existing == null || existing.isEmpty() || existing.contains("unsplash.com");
            if (needsUpdate) {
                String cloudUrl = resolvedDishUrls.get(item.getName());
                if (cloudUrl != null) {
                    item.setImageUrl(cloudUrl);
                    menuItemRepository.save(item);
                    updated++;
                }
            }
        }
        log.info("Finished updating database images. {} menu items updated.", updated);
    }

    private String getOrCreateCloudinaryUrl(String publicId, String defaultUnsplashUrl) {
        try {
            // Check if already uploaded
            Map<?, ?> result = cloudinary.api().resource(publicId, ObjectUtils.emptyMap());
            return (String) result.get("secure_url");
        } catch (Exception e) {
            log.info("Image '{}' not in Cloudinary. Uploading...", publicId);
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(defaultUnsplashUrl, ObjectUtils.asMap(
                    "public_id", publicId,
                    "overwrite", false,
                    "resource_type", "image"
                ));
                return (String) uploadResult.get("secure_url");
            } catch (Exception uploadEx) {
                log.error("Failed to upload image '{}': {}", publicId, uploadEx.getMessage());
                return defaultUnsplashUrl; // Fallback to raw Unsplash URL
            }
        }
    }
}
