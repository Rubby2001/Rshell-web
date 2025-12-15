// src/types/antivirus.d.ts
declare module '@/data/antivirus.json' {
    interface AntivirusInfo {
        processes: string[];
        url: string;
    }

    interface AntivirusData {
        [key: string]: AntivirusInfo;
    }

    const data: AntivirusData;
    export default data;
}