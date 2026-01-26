# 🔍 Ingredient Lens: AI-Powered Smart Scanner

Ingredient Lens is a mobile application that empowers users to make informed decisions about the products they put in and on their bodies. Using advanced AI image recognition, the app decodes complex ingredient lists into simple, actionable safety verdicts.

## ✨ Features

### 📸 Intelligent Scanning
- **Food Analysis:** Instantly check if a product is safe to eat, flagging harmful additives or allergens.
- **Skincare & Makeup:** Scan beauty products to identify skin-clogging ingredients, irritants, or toxic chemicals.
- **Dietary Preferences:** One-tap detection for **Vegan**, **Vegetarian**, **Halal**, and **Alcohol-Free** compliance.

### 🧪 Deep Ingredient Breakdown
- **Safety Meter:** A color-coded status (Safe, Caution, or Unsafe) for every product.
- **Plain English Summaries:** No more "chemical-speak." The app explains what ingredients actually are and why they matter.

### 🛒 Integrated Shopping
- **Find it on Amazon:** Love the product? Find it instantly on Amazon via integrated deep links.
- **Smart Alternatives:** If a product is flagged as "Unsafe," the app suggests healthier or more compatible alternatives you can buy immediately.

## 🚀 How It Works

1. **Snap:** Point your camera at any ingredient label.
2. **Analyze:** Our AI processes the text and cross-references it with global safety databases.
3. **Verdict:** Receive an instant breakdown of the product's suitability for your specific needs.
4. **Shop:** Purchase the item or a better alternative directly through your Amazon Associates connection.

## 🛠️ Tech Stack

- **Frontend:** React Native / Expo
- **AI Engine:** Google Gemini Pro Vision (OCR & Analysis)
- **Icons:** Expo Vector Icons (Ionicons & MaterialCommunityIcons)
- **API:** Amazon Product Advertising API (Associates Program)

## 📦 Installation

To run this project locally:

1. Clone the repository:
   ```bash
   git clone [git@github.com:redrazor111/is_it_good.git](git@github.com:redrazor111/is_it_good.git)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.