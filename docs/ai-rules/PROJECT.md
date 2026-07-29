# eSIM Marketplace App - Design System & Project Context

## Project Overview

Project Name: Global eSIM Marketplace

Purpose:

A mobile application that allows travelers to discover, purchase, activate, and manage eSIM plans worldwide.

The app should provide a premium travel-tech experience similar to:

* Airalo
* Nomad
* Holafly
* Wise
* Revolut
* Airbnb

Target Users:

* International travelers
* Business travelers
* Digital nomads
* Students studying abroad
* Long-term travelers

Platform:

* iOS
* Android

Design Priority:

* Trust
* Simplicity
* Speed
* Premium feel
* High conversion rate

---

# Design System

## Visual Style

Premium Travel-Tech

The application should feel modern, trustworthy, global, and technology-focused.

Do NOT redesign the visual language.

All future screens must reuse the existing design system.

---

## Color Palette

Primary:

#7B61FF

Secondary:

#5B8DEF

Gradient:

#5B8DEF → #7B61FF

Background:

#FFFFFF

Text Primary:

#111827

Text Secondary:

#6B7280

Border:

#E5E7EB

Success:

#22C55E

Warning:

#F59E0B

Error:

#EF4444

---

## Border Radius

Cards:

16px

Large Cards:

20px

Hero Cards:

24px

Buttons:

16px

---

## Shadows

Soft modern shadows.

No harsh shadows.

Cards should appear elevated but lightweight.

---

## Typography

Heading Large

Used for hero sections.

Heading Medium

Used for section titles.

Body

Used for descriptions.

Caption

Used for secondary information.

Typography should feel similar to:

* Airbnb
* Wise
* Revolut

---

## Components

Reusable Components:

* Search Bar
* Destination Card
* Region Card
* eSIM Plan Card
* CTA Button
* Bottom Navigation
* Status Badge
* Feature Card
* Summary Card
* Trust Badge
* FAQ Accordion
* Sticky Bottom CTA

Future screens should reuse these components whenever possible.

---

# User Journey

## Purchase Flow

Onboarding

↓

Home

↓

Explore / Search

↓

eSIM Detail

↓

Checkout

↓

Payment Success / eSIM Ready

↓

My eSIMs

↓

Active eSIM Detail

---

# Completed Screens

## 1. Onboarding

Status: Completed

Screens:

### Welcome

Headline:

Stay Connected Anywhere

Description:

Buy and activate eSIMs in minutes for over 200 destinations worldwide.

### Travel Purpose

Options:

* Vacation
* Business
* Study
* Long-Term Stay
* Digital Nomad

### Destination

Popular destinations:

* Japan
* Thailand
* South Korea
* Singapore
* Vietnam
* United States

### Travel Date

Calendar selection screen.

### Data Usage

Options:

* Light Use
* Moderate Use
* Heavy Use
* Unlimited

### Recommended eSIM

Example:

Japan

10GB

15 Days

4G/5G

$8.99

---

## 2. Home

Status: Completed

Sections:

### Header

Greeting

Avatar

Notifications

### Search

Primary search entry point.

### Hero Banner

Travel-focused promotional banner.

### Quick Actions

Recommended:

* Buy eSIM
* My eSIMs
* Usage
* Support

### Popular Destinations

Country cards.

### Regional Plans

Region cards.

### Global Plans

Worldwide plan section.

### Recommended Plans

Featured eSIM offers.

### My Active eSIM

Only visible when user owns an active eSIM.

### Trust Signals

Examples:

* 4.8★ Rating
* 1M+ Travelers
* 200+ Destinations
* 24/7 Support

---

## 3. Explore / Search

Status: Designed

Features:

* Search countries
* Search regions
* Recent searches
* Popular destinations
* Regional plans
* Filters
* Search results

Filters:

* Data
* Validity
* Network
* Price

---

## 4. eSIM Detail

Status: Designed

Sections:

* Hero
* Plan Summary
* Coverage
* Features
* FAQ
* Related Plans

Primary CTA:

Buy Now

Requires Google sign-in before checkout.

---

## 5. Checkout

Status: Designed

Sections:

* Selected Plan
* Promo Code
* Payment Method
* Order Summary
* Trust & Security

Primary CTA:

Complete Purchase

Behavior:

* Signed-in checkout can create a pending Stripe or SePay payment order with product metadata for future fulfillment.
* SePay checkout opens a VietQR bank-app deeplink with amount/content after order creation, renders VietQR transfer details as fallback, and waits for webhook confirmation.
* Stripe and SePay webhooks only update payment status on the order.
* eSIM access is granted by a separate fulfillment service after payment confirmation; payment webhooks must not create or unlock purchased products.
* Buyer name/email come from the signed-in Google account.

---

## 6. Payment Success / eSIM Ready

Status: Designed

Sections:

* Success Hero
* Order Summary
* eSIM Status
* Installation Preview
* Delivery Information

Primary CTA:

Install eSIM

Secondary CTA:

View My eSIM

---

# Next Screens To Design

Priority Order:

## 1. My eSIMs

Purpose:

Display all purchased eSIMs.

Requires Google sign-in before showing purchased eSIMs.

States:

* Active
* Pending Activation
* Expired

Card Information:

* Country
* Data Remaining
* Expiration Date
* Status

---

## 2. Active eSIM Detail

Purpose:

Manage an active eSIM.

Sections:

* QR Code
* Installation Guide
* Data Usage
* Remaining Data
* Validity
* Network Information
* Refresh Usage

---

## 3. Installation Guide

Separate detailed installation experience.

Platforms:

* iPhone
* Android

Steps:

Open Settings

↓

Add eSIM

↓

Scan QR Code

↓

Activate

---

## 4. Profile

Sections:

* Personal Information
* Orders
* My eSIMs
* Language
* Currency
* Settings

Language setting:

* Users can switch the whole app between English and Vietnamese from Profile settings.
* The selected language is saved locally on the device.
* UI copy should use the app i18n layer; keep AirConnect as the app name.
* Vietnamese display localizes catalog, plan detail, recommendation, and checkout price labels to VND; payment creation and order records keep the plan/payment currency.

Settings details:

* Account, Security, and Support setting rows open in-app detail panels.
* Detail panels explain the current behavior and next steps for each setting.

Quick actions:

* My eSIMs opens the purchased eSIM list.
* Transaction History opens the signed-in user's Supabase order history and shows an empty state when there are no orders.
* Saved Destinations opens an in-app empty state with a path back to Explore.
* Support opens an in-app contact screen with phone, email, and transaction history actions.

---

## 5. Support Center

Sections:

* FAQ
* Contact Support
* Live Chat
* Troubleshooting
* Device Compatibility

---

# AI Instructions

When generating new screens:

* Continue the existing design system.
* Do not invent a new visual style.
* Reuse existing components.
* Maintain visual consistency.
* Prioritize premium travel-tech aesthetics.
* Prioritize conversion and usability.
* Generate production-quality mobile UI.
* Assume previous screens already exist.
* Design only the next logical screen in the user journey.
