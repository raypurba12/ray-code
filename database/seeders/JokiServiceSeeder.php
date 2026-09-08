<?php

namespace Database\Seeders;

use App\Models\JokiService;
use Illuminate\Database\Seeder;

class JokiServiceSeeder extends Seeder
{
    public function run(): void
    {
        if (JokiService::count() > 0) {
            return;
        }

        $dev = fn (string $name, string $file) => "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{$name}/{$file}";

        $data = [
            ['slug' => 'joki-android', 'title' => 'Android Development', 'desc' => 'Aplikasi Android dengan Java/Kotlin untuk tugas akhir dan project kampus', 'category' => 'Mobile Development', 'icon' => 'smartphone', 'logo' => $dev('android', 'android-original.svg'), 'sort_order' => 1],
            ['slug' => 'joki-ios', 'title' => 'iOS Development', 'desc' => 'Aplikasi iOS dengan Swift untuk berbagai keperluan', 'category' => 'Mobile Development', 'icon' => 'smartphone', 'logo' => $dev('apple', 'apple-original.svg'), 'sort_order' => 2],
            ['slug' => 'joki-react-native', 'title' => 'React Native', 'desc' => 'Cross-platform mobile apps untuk startup dan project', 'category' => 'Mobile Development', 'icon' => 'monitor-smartphone', 'logo' => $dev('react', 'react-original.svg'), 'sort_order' => 3],
            ['slug' => 'joki-flutter', 'title' => 'Flutter', 'desc' => 'Aplikasi mobile modern dengan Flutter', 'category' => 'Mobile Development', 'icon' => 'monitor-smartphone', 'logo' => $dev('flutter', 'flutter-original.svg'), 'sort_order' => 4],
            ['slug' => 'joki-php-laravel', 'title' => 'PHP Development', 'desc' => 'PHP Native, Laravel, CodeIgniter, dan Framework Terkait', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('php', 'php-original.svg'), 'sort_order' => 5],
            ['slug' => 'joki-python-web', 'title' => 'Python Web', 'desc' => 'Django, Flask, dan Framework Python Terkait', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('python', 'python-original.svg'), 'sort_order' => 6],
            ['slug' => 'joki-java-web', 'title' => 'Java Web', 'desc' => 'Spring Boot, Quarkus, dan Framework Java Terkait', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('java', 'java-original.svg'), 'sort_order' => 7],
            ['slug' => 'joki-html-css', 'title' => 'HTML/CSS', 'desc' => 'Website statis dan frontend development', 'category' => 'Web Development', 'icon' => 'globe', 'logo' => $dev('html5', 'html5-original.svg'), 'sort_order' => 8],
            ['slug' => 'joki-javascript-typescript', 'title' => 'JavaScript/TypeScript', 'desc' => 'React, Vue, Next.js, dan Framework Modern', 'category' => 'Web Development', 'icon' => 'globe', 'logo' => $dev('javascript', 'javascript-original.svg'), 'sort_order' => 9],
            ['slug' => 'joki-c-cpp', 'title' => 'C & C++', 'desc' => 'C/C++ Native dan Framework Terkait', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('cplusplus', 'cplusplus-original.svg'), 'sort_order' => 10],
            ['slug' => 'joki-golang', 'title' => 'Go (Golang)', 'desc' => 'Backend service, REST API, dan microservice dengan Golang', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('go', 'go-original.svg'), 'sort_order' => 11],
            ['slug' => 'joki-vbnet', 'title' => 'VB.NET', 'desc' => 'Aplikasi desktop dan form Windows dengan Visual Basic .NET', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('dot-net', 'dot-net-original.svg'), 'sort_order' => 12],
            ['slug' => 'joki-aspnet', 'title' => 'ASP.NET', 'desc' => 'Web app dan API dengan ASP.NET Core / MVC', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('dotnetcore', 'dotnetcore-original.svg'), 'sort_order' => 13],
            ['slug' => 'joki-wordpress', 'title' => 'WordPress', 'desc' => 'Website WordPress: tema, plugin, WooCommerce, dan custom development', 'category' => 'Web Development', 'icon' => 'globe', 'logo' => $dev('wordpress', 'wordpress-original.svg'), 'sort_order' => 14],
            ['slug' => 'joki-nestjs', 'title' => 'NestJS', 'desc' => 'Backend TypeScript terstruktur dengan NestJS dan REST/GraphQL', 'category' => 'Web Development', 'icon' => 'layers', 'logo' => $dev('nestjs', 'nestjs-original.svg'), 'sort_order' => 15],
            ['slug' => 'joki-kotlin', 'title' => 'Kotlin (Non-Android)', 'desc' => 'Backend Kotlin dengan Ktor atau Spring Boot, dan scripting Kotlin', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('kotlin', 'kotlin-original.svg'), 'sort_order' => 16],
            ['slug' => 'joki-rust', 'title' => 'Rust', 'desc' => 'Systems programming, CLI tool, dan WebAssembly dengan Rust', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('rust', 'rust-original.svg'), 'sort_order' => 17],
            ['slug' => 'joki-nodejs-backend', 'title' => 'Backend Node.js', 'desc' => 'Express, NestJS untuk backend fullstack', 'category' => 'Database & Backend', 'icon' => 'server', 'logo' => $dev('nodejs', 'nodejs-original.svg'), 'sort_order' => 18],
            ['slug' => 'joki-database-mysql', 'title' => 'Database MySQL', 'desc' => 'Perancangan ERD, Query, JOIN, VIEW, TRIGGER, Stored Procedure', 'category' => 'Database & Backend', 'icon' => 'database', 'logo' => $dev('mysql', 'mysql-original.svg'), 'sort_order' => 19],
            ['slug' => 'joki-postgresql', 'title' => 'PostgreSQL', 'desc' => 'Database design dan optimasi query PostgreSQL', 'category' => 'Database & Backend', 'icon' => 'database', 'logo' => $dev('postgresql', 'postgresql-original.svg'), 'sort_order' => 20],
            ['slug' => 'joki-mongodb', 'title' => 'MongoDB', 'desc' => 'NoSQL database untuk aplikasi modern', 'category' => 'Database & Backend', 'icon' => 'database', 'logo' => $dev('mongodb', 'mongodb-original.svg'), 'sort_order' => 21],
            ['slug' => 'joki-rest-api', 'title' => 'REST API', 'desc' => 'Pembuatan REST API dengan JWT Authentication dan integrasi pihak ketiga', 'category' => 'Database & Backend', 'icon' => 'server', 'logo' => $dev('fastapi', 'fastapi-original.svg'), 'sort_order' => 22],
            ['slug' => 'joki-graphql', 'title' => 'GraphQL & Apollo', 'desc' => 'API GraphQL dengan Apollo Server/Client dan integrasi database', 'category' => 'Database & Backend', 'icon' => 'server', 'logo' => $dev('graphql', 'graphql-plain.svg'), 'sort_order' => 23],
            ['slug' => 'joki-vps-hosting', 'title' => 'VPS & Hosting', 'desc' => 'Setup VPS, hosting, domain, dan SSL', 'category' => 'DevOps & Deployment', 'icon' => 'server', 'logo' => $dev('ubuntu', 'ubuntu-plain.svg'), 'sort_order' => 24],
            ['slug' => 'joki-docker-cicd', 'title' => 'Docker & CI/CD', 'desc' => 'Containerization dan deployment automation', 'category' => 'DevOps & Deployment', 'icon' => 'blocks', 'logo' => $dev('docker', 'docker-original.svg'), 'sort_order' => 25],
            ['slug' => 'joki-linux-bash', 'title' => 'Linux & Bash Scripting', 'desc' => 'Skrip shell, administrasi sistem Linux, dan otomasi command line', 'category' => 'DevOps & Deployment', 'icon' => 'server', 'logo' => $dev('linux', 'linux-original.svg'), 'sort_order' => 26],
            ['slug' => 'joki-kubernetes', 'title' => 'Kubernetes (K8s)', 'desc' => 'Orkestrasi container dengan Kubernetes, Helm, dan deployment cluster', 'category' => 'DevOps & Deployment', 'icon' => 'blocks', 'logo' => $dev('kubernetes', 'kubernetes-plain.svg'), 'sort_order' => 27],
            ['slug' => 'joki-machine-learning', 'title' => 'Machine Learning', 'desc' => 'TensorFlow, PyTorch, Sklearn untuk skripsi dan paper', 'category' => 'AI & Machine Learning', 'icon' => 'brain-circuit', 'logo' => $dev('tensorflow', 'tensorflow-original.svg'), 'sort_order' => 28],
            ['slug' => 'joki-computer-vision', 'title' => 'Computer Vision', 'desc' => 'YOLO, OpenCV untuk deteksi dan klasifikasi', 'category' => 'AI & Machine Learning', 'icon' => 'brain-circuit', 'logo' => $dev('opencv', 'opencv-original.svg'), 'sort_order' => 29],
            ['slug' => 'joki-nlp-chatbot', 'title' => 'NLP & Chatbot', 'desc' => 'Natural Language Processing dan AI Chatbot', 'category' => 'AI & Machine Learning', 'icon' => 'brain-circuit', 'logo' => $dev('python', 'python-original.svg'), 'sort_order' => 30],
            ['slug' => 'joki-data-science', 'title' => 'Data Science', 'desc' => 'Data Cleaning, Visualisasi, Analisis Dataset dengan Python', 'category' => 'Data Science', 'icon' => 'bar-chart3', 'logo' => $dev('python', 'python-original.svg'), 'sort_order' => 31],
            ['slug' => 'joki-web-scraping', 'title' => 'Web Scraping', 'desc' => 'Scraping website dan bot otomatis dengan Python', 'category' => 'Data Science', 'icon' => 'bar-chart3', 'logo' => $dev('python', 'python-original.svg'), 'sort_order' => 32],
            ['slug' => 'joki-tableau', 'title' => 'Tableau', 'desc' => 'Visualisasi data dan dashboard interaktif dengan Tableau', 'category' => 'Data Science', 'icon' => 'bar-chart3', 'logo' => null, 'sort_order' => 33],
            ['slug' => 'joki-r-programming', 'title' => 'R Programming', 'desc' => 'Analisis statistik, visualisasi data, dan machine learning dengan R', 'category' => 'Data Science', 'icon' => 'bar-chart3', 'logo' => $dev('r', 'r-original.svg'), 'sort_order' => 34],
            ['slug' => 'joki-matlab', 'title' => 'Matlab / Simulink', 'desc' => 'Simulasi, pengolahan sinyal, dan komputasi numerik dengan Matlab', 'category' => 'Data Science', 'icon' => 'bar-chart3', 'logo' => $dev('matlab', 'matlab-original.svg'), 'sort_order' => 35],
            ['slug' => 'joki-excel-vba', 'title' => 'Excel & VBA Macro', 'desc' => 'Formula lanjutan, pivot table, makro VBA, dan otomasi laporan Excel', 'category' => 'Data Science', 'icon' => 'bar-chart3', 'logo' => null, 'sort_order' => 36],
            ['slug' => 'joki-spss-lanjutan', 'title' => 'SPSS Lanjutan (SEM & PLS)', 'desc' => 'AMOS, SmartPLS, LISREL untuk SEM, path analysis, dan uji lanjutan', 'category' => 'Data Science', 'icon' => 'bar-chart3', 'logo' => null, 'sort_order' => 37],
            ['slug' => 'joki-skripsi-tugas-akhir', 'title' => 'Skripsi & Tugas Akhir', 'desc' => 'Bantu coding TA, perbaikan error, optimasi, konsultasi sistem', 'category' => 'Layanan Perkuliahan', 'icon' => 'graduation-cap', 'logo' => null, 'sort_order' => 38],
            ['slug' => 'joki-spss-statistik', 'title' => 'SPSS & Statistik', 'desc' => 'Input data, uji validitas, regresi, ANOVA, interpretasi hasil', 'category' => 'Layanan Perkuliahan', 'icon' => 'bar-chart3', 'logo' => null, 'sort_order' => 39],
            ['slug' => 'joki-flowchart-uml', 'title' => 'Flowchart & UML', 'desc' => 'Flowchart, Use Case, Class, Sequence Diagram dengan PlantUML', 'category' => 'Layanan Perkuliahan', 'icon' => 'file-text', 'logo' => null, 'sort_order' => 40],
            ['slug' => 'joki-proposal-paper', 'title' => 'Proposal & Paper', 'desc' => 'Proposal penelitian, paper IEEE/Scopus, sitasi, parafrase', 'category' => 'Layanan Perkuliahan', 'icon' => 'file-text', 'logo' => null, 'sort_order' => 41],
            ['slug' => 'joki-mentoring', 'title' => 'Mentoring Coding', 'desc' => 'Bimbingan 1-on-1 untuk belajar coding, debug, dan konsultasi proyek', 'category' => 'Layanan Perkuliahan', 'icon' => 'graduation-cap', 'logo' => null, 'sort_order' => 42],
            ['slug' => 'joki-laporan', 'title' => 'Pembuatan Laporan', 'desc' => 'Laporan praktikum, PKL, KKN, dan laporan tugas kuliah berbagai format', 'category' => 'Layanan Perkuliahan', 'icon' => 'file-text', 'logo' => null, 'sort_order' => 43],
            ['slug' => 'joki-ppt', 'title' => 'Presentasi PPT', 'desc' => 'Desain slide PowerPoint/Canva profesional untuk sidang, seminar, dan tugas', 'category' => 'Layanan Perkuliahan', 'icon' => 'presentation', 'logo' => null, 'sort_order' => 44],
            ['slug' => 'joki-matematika-diskrit', 'title' => 'Matematika Diskrit & Numerik', 'desc' => 'Aljabar linear, kombinatorika, graf, dan komputasi numerik', 'category' => 'Layanan Perkuliahan', 'icon' => 'calculator', 'logo' => null, 'sort_order' => 45],
            ['slug' => 'joki-game-development', 'title' => 'Game Development', 'desc' => 'Unity C#, Roblox Studio, Game Edukasi, MIT App Inventor', 'category' => 'Game & Multimedia', 'icon' => 'gamepad2', 'logo' => $dev('unity', 'unity-original.svg'), 'sort_order' => 46],
            ['slug' => 'joki-uiux-design', 'title' => 'UI/UX Design', 'desc' => 'Figma, Wireframe, Mockup, Desain Aplikasi dan Web', 'category' => 'Game & Multimedia', 'icon' => 'layers', 'logo' => $dev('figma', 'figma-original.svg'), 'sort_order' => 47],
            ['slug' => 'joki-scratch', 'title' => 'Scratch', 'desc' => 'Pemrograman visual Scratch untuk tugas sekolah dan pengenalan coding', 'category' => 'Game & Multimedia', 'icon' => 'blocks', 'logo' => null, 'sort_order' => 48],
            ['slug' => 'joki-mit-app-inventor', 'title' => 'MIT App Inventor', 'desc' => 'Aplikasi Android visual dengan MIT App Inventor untuk tugas sekolah/kuliah', 'category' => 'Game & Multimedia', 'icon' => 'blocks', 'logo' => $dev('android', 'android-original.svg'), 'sort_order' => 49],
            ['slug' => 'joki-iot', 'title' => 'IoT (Internet of Things)', 'desc' => 'Sistem IoT dengan sensor, MQTT, dan platform cloud', 'category' => 'IoT & Hardware', 'icon' => 'cpu', 'logo' => $dev('arduino', 'arduino-original.svg'), 'sort_order' => 50],
            ['slug' => 'joki-arduino', 'title' => 'Arduino', 'desc' => 'Pemrograman Arduino untuk tugas elektronika dan sistem embedded', 'category' => 'IoT & Hardware', 'icon' => 'cpu', 'logo' => $dev('arduino', 'arduino-original.svg'), 'sort_order' => 51],
            ['slug' => 'joki-assembly', 'title' => 'Assembly & Mikroprosesor', 'desc' => 'Pemrograman Assembly, arsitektur CPU, dan simulasi mikroprosesor', 'category' => 'IoT & Hardware', 'icon' => 'cpu', 'logo' => null, 'sort_order' => 52],
            ['slug' => 'joki-pascal-delphi', 'title' => 'Pascal & Delphi', 'desc' => 'Pemrograman Pascal dan aplikasi desktop Delphi untuk tugas kuliah', 'category' => 'IoT & Hardware', 'icon' => 'cpu', 'logo' => null, 'sort_order' => 53],
            ['slug' => 'joki-cisco', 'title' => 'Cisco & Jaringan', 'desc' => 'Konfigurasi Cisco, CCNA, routing, switching, dan simulasi Packet Tracer', 'category' => 'Networking', 'icon' => 'network', 'logo' => null, 'sort_order' => 54],
            ['slug' => 'joki-mikrotik', 'title' => 'Mikrotik & Jaringan', 'desc' => 'Konfigurasi Mikrotik, routing, firewall, hotspot, dan VLAN', 'category' => 'Networking', 'icon' => 'network', 'logo' => null, 'sort_order' => 55],
            ['slug' => 'joki-cybersecurity', 'title' => 'Cybersecurity & CTF', 'desc' => 'CTF, pentest dasar, keamanan jaringan, dan ethical hacking', 'category' => 'Cybersecurity', 'icon' => 'shield', 'logo' => null, 'sort_order' => 56],
            ['slug' => 'joki-blockchain', 'title' => 'Blockchain & Web3', 'desc' => 'Smart contract Solidity, DApp, dan integrasi blockchain Ethereum', 'category' => 'Cybersecurity', 'icon' => 'shield', 'logo' => $dev('solidity', 'solidity-original.svg'), 'sort_order' => 57],
            ['slug' => 'joki-debugging', 'title' => 'Debugging & Fix Error', 'desc' => 'Lacak dan perbaiki bug, error, crash pada kode apapun dengan cepat', 'category' => 'Database & Backend', 'icon' => 'bug', 'logo' => null, 'sort_order' => 58],
            ['slug' => 'joki-rust-lanjutan', 'title' => 'Rust Lanjutan', 'desc' => 'Systems programming lanjutan dengan Rust (opsional)', 'category' => 'Web Development', 'icon' => 'code2', 'logo' => $dev('rust', 'rust-original.svg'), 'sort_order' => 59],
        ];

        foreach ($data as $row) {
            JokiService::create($row);
        }
    }
}
