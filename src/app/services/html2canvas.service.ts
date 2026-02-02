import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
    providedIn: 'root'
})
export class Html2CanvasService {

    async captureElement(elementId: string): Promise<string> {
        const el = document.getElementById(elementId);
        if (!el) throw new Error('Element tidak ditemukan: ' + elementId);

        const canvas = await html2canvas(el, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false
        });

        return canvas.toDataURL("image/png");
    }
}
