<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index()
    {
        $threads = User::where('role', 'client')
            ->withExists(['messages as has_unread' => fn ($q) => $q->where('sender_role', 'admin')->whereNull('read_at')])
            ->withCount(['messages as last_message_at' => fn ($q) => $q->select('created_at')->latest()->take(1)])
            ->orderByDesc('last_message_at')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Messages', [
            'threads' => $threads,
            'contactMessages' => ContactMessage::latest()->get(),
        ]);
    }

    public function show(User $user)
    {
        $thread = Message::where('user_id', $user->id)->orderBy('created_at')->get();
        Message::where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['messages' => $thread]);
    }

    public function reply(Request $request, User $user)
    {
        $validated = $request->validate(['body' => ['required', 'string', 'max:5000']]);

        Message::create([
            'user_id' => $user->id,
            'sender_role' => 'admin',
            'sender_name' => $request->user()->name,
            'body' => $validated['body'],
        ]);

        return back();
    }

    public function markContactRead(ContactMessage $contact)
    {
        $contact->update(['read_at' => $contact->read_at ?? now()]);

        return back();
    }

    public function destroyContact(ContactMessage $contact)
    {
        $contact->delete();

        return back()->with('success', 'Message deleted.');
    }
}
