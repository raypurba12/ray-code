<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $messages = Message::where('user_id', $request->user()->id)
            ->orderBy('created_at')
            ->get();

        // mark admin messages as read
        Message::where('user_id', $request->user()->id)
            ->where('sender_role', 'admin')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Client/Messages', ['messages' => $messages]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        Message::create([
            'user_id' => $request->user()->id,
            'sender_role' => 'client',
            'sender_name' => $request->user()->name,
            'body' => $validated['body'],
        ]);

        return back();
    }
}
