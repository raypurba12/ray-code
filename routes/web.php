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
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\TrackOrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::redirect('/layanan-reguler', '/services?type=package', 301)->name('services.reguler');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');

Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/portfolio/{slug}', [PortfolioController::class, 'show'])->name('portfolio.show');

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');

Route::get('/pricing', [PricingController::class, 'index'])->name('pricing');
Route::get('/estimator', [EstimatorController::class, 'index'])->name('estimator');
Route::post('/estimator/lead', [EstimatorController::class, 'storeLead'])->middleware('throttle:10,60')->name('estimator.lead');
Route::get('/pantau-pesanan', [TrackOrderController::class, 'index'])->middleware('throttle:30,1')->name('track.index');
Route::post('/pantau-pesanan/lookup', function (Request $r) {
    $code = strtoupper(trim($r->input('code', '')));

    return redirect()->route('track.index', ['code' => $code]);
})->middleware('throttle:10,1')->name('track.lookup');
Route::post('/track/{code}/pay', [TrackOrderController::class, 'pay'])->middleware('throttle:10,1')->name('track.pay');
Route::get('/pay/{code}', [TrackOrderController::class, 'payShort'])->middleware('throttle:10,1')->name('pay.short');
Route::get('/invoice/{code}/pdf', [TrackOrderController::class, 'invoicePdf'])->middleware('throttle:30,1')->name('invoice.pdf');
Route::get('/pantau-pesanan/{code}/files/{file}/download', [TrackOrderController::class, 'downloadFile'])->middleware('throttle:30,1')->name('track.files.download');
Route::get('/pantau-pesanan/{code}/files/{file}/preview', [TrackOrderController::class, 'previewFile'])->middleware('throttle:60,1')->name('track.files.preview');
Route::get('/pantau-pesanan/{code}/files/download-zip', [TrackOrderController::class, 'downloadFilesZip'])->middleware('throttle:30,1')->name('track.files.zip');
Route::get('/faq', [FaqController::class, 'index'])->name('faq');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:3,1')->name('contact.store');

Route::get('/cara-pesan', fn () => Inertia::render('Public/CaraPesan'))->name('cara-pesan');

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', function () {
    $base = rtrim(config('app.url', 'https://raycode.dev'), '/');
    $txt = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nSitemap: {$base}/sitemap.xml\n";

    return response($txt, 200)->header('Content-Type', 'text/plain');
})->name('robots');

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login.attempt');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1')->name('register.store');

    // Password Reset (P0-2)
    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail'])->middleware('throttle:5,1')->name('password.email');
    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1')->name('password.update');
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
    Route::get('/projects/{project}/files/{file}/download', [Client\ProjectController::class, 'downloadFile'])->name('projects.files.download');
    Route::get('/projects/{project}/files/download-zip', [Client\ProjectController::class, 'downloadAll'])->name('projects.files.zip');
    Route::post('/projects/{project}/testimonial', [Client\ProjectController::class, 'storeTestimonial'])->name('projects.testimonial');
    Route::get('/order', [Client\OrderController::class, 'create'])->name('order.create');
    Route::post('/order', [Client\OrderController::class, 'store'])->name('order.store');
    Route::get('/invoices', [Client\InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [Client\InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('/invoices/{invoice}/pay', [Client\InvoiceController::class, 'pay'])->name('invoices.pay');
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
    Route::post('/orders/manual', [Admin\OrderController::class, 'storeManual'])->name('orders.manual');
    Route::patch('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order}/invoice', [Admin\OrderController::class, 'generateInvoice'])->name('orders.invoice');
    Route::post('/orders/{order}/invoice/final', [Admin\OrderController::class, 'generateFinalInvoice'])->name('orders.invoice.final');
    Route::post('/orders/{order}/invoice/resend', [Admin\OrderController::class, 'resendInvoice'])->name('orders.invoice.resend');

    Route::get('/projects', [Admin\ProjectController::class, 'index'])->name('projects.index');
    Route::patch('/projects/{project}', [Admin\ProjectController::class, 'update'])->name('projects.update');
    Route::post('/projects/{project}/files', [Admin\ProjectController::class, 'uploadFile'])->name('projects.files.store');
    Route::delete('/projects/{project}/files/{file}', [Admin\ProjectController::class, 'destroyFile'])->name('projects.files.destroy');

    Route::get('/services', [Admin\ServiceController::class, 'index'])->name('services.index');
    Route::post('/services', [Admin\ServiceController::class, 'store'])->name('services.store');
    Route::put('/services/{service}', [Admin\ServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [Admin\ServiceController::class, 'destroy'])->name('services.destroy');

    Route::get('/joki-services', [Admin\JokiServiceController::class, 'index'])->name('joki-services.index');
    Route::post('/joki-services', [Admin\JokiServiceController::class, 'store'])->name('joki-services.store');
    Route::put('/joki-services/header', [Admin\JokiServiceController::class, 'updateHeader'])->name('joki-services.header');
    Route::post('/joki-services/auto-translate', [Admin\JokiServiceController::class, 'autoTranslateAll'])->name('joki-services.auto-translate');
    Route::post('/joki-services/bulk-update', [Admin\JokiServiceController::class, 'bulkUpdate'])->name('joki-services.bulk');
    Route::put('/joki-services/{jokiService}', [Admin\JokiServiceController::class, 'update'])->name('joki-services.update');
    Route::delete('/joki-services/{jokiService}', [Admin\JokiServiceController::class, 'destroy'])->name('joki-services.destroy');

    Route::get('/portfolios', [Admin\PortfolioController::class, 'index'])->name('portfolios.index');
    Route::post('/portfolios', [Admin\PortfolioController::class, 'store'])->name('portfolios.store');
    Route::put('/portfolios/{portfolio}', [Admin\PortfolioController::class, 'update'])->name('portfolios.update');
    Route::delete('/portfolios/{portfolio}', [Admin\PortfolioController::class, 'destroy'])->name('portfolios.destroy');

    Route::get('/users', [Admin\UserController::class, 'index'])->name('users.index');
    Route::post('/users/bulk', [Admin\UserController::class, 'bulkAction'])->name('users.bulk');
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
    Route::get('/estimator-leads', [Admin\EstimatorController::class, 'leads'])->name('estimator.leads');

    Route::get('/messages', [Admin\MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{user}', [Admin\MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{user}/reply', [Admin\MessageController::class, 'reply'])->name('messages.reply');
    Route::patch('/contacts/{contact}/read', [Admin\MessageController::class, 'markContactRead'])->name('contacts.read');
    Route::delete('/contacts/{contact}', [Admin\MessageController::class, 'destroyContact'])->name('contacts.destroy');
});
