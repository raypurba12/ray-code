<?php

use App\Http\Controllers\Api\MidtransWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handle'])->name('api.midtrans.webhook');
