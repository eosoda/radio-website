# **App Name**: Rádio Vida FM

## Core Features:

- Persistent Audio Player: HTML5 audio player implemented in the root layout that persists across all pages and includes play/pause, volume control, and mute functionality.
- Admin Authentication: Firebase Authentication protects the admin panel, allowing access only to users with valid email/password credentials or via Google authentication.
- Dynamic Stream URL: Admin can modify the radio stream URL, which is then updated live for all users.
- Content Visibility Toggles: Firestore stores boolean flags that control the visibility of About, Programming, Verse, and Now Playing sections on the home page. Admin can control it via panel.
- Programmable radio schedule: Admin user is able to Create, Read, Update and Delete programs from a radio schedule.
- Now Playing Display: Display metadata for the stream if available via ICEcast metadata. The stream's Now Playing is populated.

## Style Guidelines:

- Primary color: Deep purple (#6B21A8) to create an elegant and calm mood.
- Background color: Desaturated deep purple (#2A0D45) to complement the primary.
- Accent color: Golden (#D4AF37) for highlights and interactive elements, offering an elegant contrast.
- Headline font: 'Playfair', a modern sans-serif with high contrast for an elegant and fashionable touch.
- Body font: 'PT Sans', a humanist sans-serif, which is ideal for creating an accessible and inviting reading experience.
- Use lucide-react icons for a consistent and clean UI.
- Mobile-first design approach to ensure a responsive layout.
- Subtle transitions and animations for user interactions to enhance the user experience.