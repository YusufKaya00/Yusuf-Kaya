import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json');

// Projeleri JSON dosyasından oku
function getProjects() {
    try {
        const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Projeler okunamadı:', error);
        return [];
    }
}

// Projeleri JSON dosyasına yaz
function saveProjects(projects: any[]) {
    try {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Projeler kaydedilemedi:', error);
        return false;
    }
}

// GET: Tüm projeleri listele
export async function GET() {
    try {
        const projects = getProjects();
        // Sıralama ve görünürlük filtreleme
        const sortedProjects = projects
            .filter((p: any) => p.visible !== false)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

        return NextResponse.json(sortedProjects);
    } catch (error) {
        return NextResponse.json(
            { error: 'Projeler yüklenemedi' },
            { status: 500 }
        );
    }
}

// POST: Yeni proje ekle
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const projects = getProjects();

        // Yeni proje için ID oluştur
        const id = body.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // ID benzersiz olmalı
        const existingProject = projects.find((p: any) => p.id === id);
        if (existingProject) {
            return NextResponse.json(
                { error: 'Bu isimde bir proje zaten var' },
                { status: 400 }
            );
        }

        const newProject = {
            id,
            title: body.title,
            description: body.description || '',
            image: body.image || '/projects/default.jpg',
            detailPage: body.detailPage || `/projects/${id}`,
            technologies: body.technologies || [],
            order: projects.length + 1,
            visible: body.visible !== false,
            // Detail page fields
            longDescription: body.longDescription || '',
            features: body.features || [],
            buttonLabel: body.buttonLabel || '',
            buttonUrl: body.buttonUrl || '',
            githubUrl: body.githubUrl || '',
            createdAt: new Date().toISOString()
        };

        projects.push(newProject);

        if (!saveProjects(projects)) {
            return NextResponse.json(
                { error: 'Proje kaydedilemedi' },
                { status: 500 }
            );
        }

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Proje eklenirken hata:', error);
        return NextResponse.json(
            { error: 'Proje eklenemedi' },
            { status: 500 }
        );
    }
}
