import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Görsel yükleme dizini
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'projects', 'uploads');

// Upload dizinini oluştur
function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}

export async function POST(request: Request) {
    try {
        ensureUploadDir();

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Dosya bulunamadı' },
                { status: 400 }
            );
        }

        // Dosya boyutu kontrolü (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Dosya boyutu 5MB\'dan küçük olmalı' },
                { status: 400 }
            );
        }

        // Dosya tipi kontrolü
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Sadece JPEG, PNG, GIF ve WebP formatları desteklenir' },
                { status: 400 }
            );
        }

        // Benzersiz dosya adı oluştur
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const fileName = `project-${timestamp}.${extension}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        // Dosyayı kaydet
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(filePath, buffer);

        // Public URL döndür
        const publicUrl = `/projects/uploads/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName: fileName
        });
    } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        return NextResponse.json(
            { error: 'Dosya yüklenemedi' },
            { status: 500 }
        );
    }
}

// DELETE: Yüklenen görseli sil
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('fileName');

        if (!fileName || !/^project-\d+\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
            return NextResponse.json(
                { error: 'Geçersiz dosya adı formatı veya yetkisiz işlem' },
                { status: 400 }
            );
        }

        const filePath = path.join(UPLOAD_DIR, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return NextResponse.json({ success: true, message: 'Dosya silindi' });
        } else {
            return NextResponse.json(
                { error: 'Dosya bulunamadı' },
                { status: 404 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Dosya silinemedi' },
            { status: 500 }
        );
    }
}
