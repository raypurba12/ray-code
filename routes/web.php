<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\Client;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\EstimatorController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/layanan-reguler', [ServiceController::class, 'reguler'])->name('services.reguler');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');

Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/portfolio/{slug}', [PortfolioController::class, 'show'])->name('portfolio.show');

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');

Route::get('/pricing', [PricingController::class, 'index'])->name('pricing');
Route::get('/estimator', [EstimatorController::class, 'index'])->name('estimator');
Route::get('/faq', [FaqController::class, 'index'])->name('faq');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('/cara-pesan', fn () => Inertia::render('Public/CaraPesan'))->name('cara-pesan');

Route::get('/campus-smash', fn () => Inertia::render('Public/CampusSmash'))->name('campus-smash');
Route::get('/campus-adventure', fn () => Inertia::render('Public/CampusAdventure'))->name('campus-adventure');

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

/*
|--------------------------------------------------------------------------
| Client dashboard
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('dashboard')->name('client.')->group(function () {
    Route::get('/', [Client\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/projects/{project}', [Client\ProjectController::class, 'show'])->name('projects.show');
    Route::get('/order', [Client\OrderController::class, 'create'])->name('order.create');
    Route::post('/order', [Client\OrderController::class, 'store'])->name('order.store');
    Route::get('/invoices', [Client\InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [Client\InvoiceController::class, 'show'])->name('invoices.show');
    Route::get('/messages', [Client\MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [Client\MessageController::class, 'store'])->name('messages.store');
});

/*
|--------------------------------------------------------------------------
| Admin panel
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/orders', [Admin\OrderController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order}/invoice', [Admin\OrderController::class, 'generateInvoice'])->name('orders.invoice');

    Route::get('/projects', [Admin\ProjectController::class, 'index'])->name('projects.index');
    Route::patch('/projects/{project}', [Admin\ProjectController::class, 'update'])->name('projects.update');

    Route::get('/services', [Admin\ServiceController::class, 'index'])->name('services.index');
    Route::post('/services', [Admin\ServiceController::class, 'store'])->name('services.store');
    Route::put('/services/{service}', [Admin\ServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [Admin\ServiceController::class, 'destroy'])->name('services.destroy');

    Route::get('/joki-services', [Admin\JokiServiceController::class, 'index'])->name('joki-services.index');
    Route::post('/joki-services', [Admin\JokiServiceController::class, 'store'])->name('joki-services.store');
    Route::put('/joki-services/header', [Admin\JokiServiceController::class, 'updateHeader'])->name('joki-services.header');
    Route::post('/joki-services/auto-translate', [Admin\JokiServiceController::class, 'autoTranslateAll'])->name('joki-services.auto-translate');
    Route::put('/joki-services/{jokiService}', [Admin\JokiServiceController::class, 'update'])->name('joki-services.update');
    Route::delete('/joki-services/{jokiService}', [Admin\JokiServiceController::class, 'destroy'])->name('joki-services.destroy');

    Route::get('/portfolios', [Admin\PortfolioController::class, 'index'])->name('portfolios.index');
    Route::post('/portfolios', [Admin\PortfolioController::class, 'store'])->name('portfolios.store');
    Route::put('/portfolios/{portfolio}', [Admin\PortfolioController::class, 'update'])->name('portfolios.update');
    Route::delete('/portfolios/{portfolio}', [Admin\PortfolioController::class, 'destroy'])->name('portfolios.destroy');

    Route::get('/users', [Admin\UserController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [Admin\UserController::class, 'updateRole'])->name('users.role');
    Route::delete('/users/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/testimonials', [Admin\TestimonialController::class, 'index'])->name('testimonials.index');
    Route::post('/testimonials', [Admin\TestimonialController::class, 'store'])->name('testimonials.store');
    Route::patch('/testimonials/{testimonial}', [Admin\TestimonialController::class, 'update'])->name('testimonials.update');
    Route::delete('/testimonials/{testimonial}', [Admin\TestimonialController::class, 'destroy'])->name('testimonials.destroy');

    Route::get('/pricing-plans', [Admin\PricingPlanController::class, 'index'])->name('pricing-plans.index');
    Route::post('/pricing-plans', [Admin\PricingPlanController::class, 'store'])->name('pricing-plans.store');
    Route::put('/pricing-plans/{pricingPlan}', [Admin\PricingPlanController::class, 'update'])->name('pricing-plans.update');
    Route::delete('/pricing-plans/{pricingPlan}', [Admin\PricingPlanController::class, 'destroy'])->name('pricing-plans.destroy');

    Route::get('/faqs', [Admin\FaqController::class, 'index'])->name('faqs.index');
    Route::post('/faqs', [Admin\FaqController::class, 'store'])->name('faqs.store');
    Route::put('/faqs/{faq}', [Admin\FaqController::class, 'update'])->name('faqs.update');
    Route::delete('/faqs/{faq}', [Admin\FaqController::class, 'destroy'])->name('faqs.destroy');

    Route::get('/blog', [Admin\BlogController::class, 'index'])->name('blog.index');
    Route::post('/blog', [Admin\BlogController::class, 'store'])->name('blog.store');
    Route::put('/blog/{post}', [Admin\BlogController::class, 'update'])->name('blog.update');
    Route::delete('/blog/{post}', [Admin\BlogController::class, 'destroy'])->name('blog.destroy');

    Route::get('/settings', [Admin\SettingController::class, 'index'])->name('settings.index');
    Route::put('/settings', [Admin\SettingController::class, 'update'])->name('settings.update');

    Route::get('/homepage', [Admin\HomepageController::class, 'index'])->name('homepage.index');
    Route::put('/homepage', [Admin\HomepageController::class, 'update'])->name('homepage.update');

    Route::get('/estimator', [Admin\EstimatorController::class, 'index'])->name('estimator.index');
    Route::put('/estimator', [Admin\EstimatorController::class, 'update'])->name('estimator.update');

    Route::get('/messages', [Admin\MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{user}', [Admin\MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{user}/reply', [Admin\MessageController::class, 'reply'])->name('messages.reply');
    Route::patch('/contacts/{contact}/read', [Admin\MessageController::class, 'markContactRead'])->name('contacts.read');
    Route::delete('/contacts/{contact}', [Admin\MessageController::class, 'destroyContact'])->name('contacts.destroy');
});
