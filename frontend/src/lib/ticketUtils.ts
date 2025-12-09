import { Event } from './api';

export const downloadQRCode = (svgId: string, filename: string) => {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${filename}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
};

export const generateICS = (event: Event) => {
    // Basic ICS format
    // Note: Dates should be formatted properly (YYYYMMDDTHHMMSSZ)
    // For simplicity, we'll assume event.date is YYYY-MM-DD and event.time is HH:MM
    // We'll construct a basic start time.

    const formatDate = (dateStr: string, timeStr: string) => {
        const date = new Date(`${dateStr}T${timeStr}`);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startTime = formatDate(event.date, event.time);
    const endTime = formatDate(event.date, '23:59'); // Default to end of day or +2 hours if we had duration

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UpSosh//Booking//EN
BEGIN:VEVENT
UID:${event.id}@upsosh.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.venue}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
