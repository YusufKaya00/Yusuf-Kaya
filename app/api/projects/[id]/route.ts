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
        return [];
    }
}

// Projeleri JSON dosyasına yaz
function saveProjects(projects: any[]) {
    try {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
        return true;
    } catch (error) {
        return false;
    }
}

// GET: Tekil proje getir
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projects = getProjects();
        const project = projects.find((p: any) => p.id === id);

        if (!project) {
            return NextResponse.json(
                { error: 'Proje bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json(
            { error: 'Proje yüklenemedi' },
            { status: 500 }
        );
    }
}

// PUT: Proje güncelle
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const projects = getProjects();
        const index = projects.findIndex((p: any) => p.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Proje bulunamadı' },
                { status: 404 }
            );
        }

        // Mevcut projeyi güncelle
        projects[index] = {
            ...projects[index],
            title: body.title ?? projects[index].title,
            description: body.description ?? projects[index].description,
            image: body.image ?? projects[index].image,
            detailPage: body.detailPage ?? projects[index].detailPage,
            technologies: body.technologies ?? projects[index].technologies,
            order: body.order ?? projects[index].order,
            visible: body.visible ?? projects[index].visible,
            // Detail page fields
            longDescription: body.longDescription ?? projects[index].longDescription,
            features: body.features ?? projects[index].features,
            gallery: body.gallery ?? projects[index].gallery,
            buttonLabel: body.buttonLabel ?? projects[index].buttonLabel,
            buttonUrl: body.buttonUrl ?? projects[index].buttonUrl,
            githubUrl: body.githubUrl ?? projects[index].githubUrl,
            updatedAt: new Date().toISOString()
        };

        if (!saveProjects(projects)) {
            return NextResponse.json(
                { error: 'Proje kaydedilemedi' },
                { status: 500 }
            );
        }

        return NextResponse.json(projects[index]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Proje güncellenemedi' },
            { status: 500 }
        );
    }
}

// DELETE: Proje sil
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projects = getProjects();
        const index = projects.findIndex((p: any) => p.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Proje bulunamadı' },
                { status: 404 }
            );
        }

        const deletedProject = projects.splice(index, 1)[0];

        if (!saveProjects(projects)) {
            return NextResponse.json(
                { error: 'Proje silinemedi' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Proje silindi',
            project: deletedProject
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Proje silinemedi' },
            { status: 500 }
        );
    }
}
