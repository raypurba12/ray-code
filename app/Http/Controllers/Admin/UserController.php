<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Users', [
            'users' => User::withCount('projects')
                ->when($request->query('role'), fn ($q, $r) => $q->where('role', $r))
                ->when($request->query('search'), fn ($q, $s) => $q->where(fn ($qq) => $qq
                    ->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")))
                ->orderBy('created_at')
                ->paginate(12)
                ->withQueryString(),
            'filters' => [
                'role' => $request->query('role'),
                'search' => $request->query('search'),
            ],
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', "You can't change your own role.");
        }

        $validated = $request->validate(['role' => ['required', 'in:admin,client']]);
        $user->update($validated);

        return back()->with('success', "{$user->name} is now a {$validated['role']}.");
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', "You can't delete yourself.");
        }

        $user->delete();

        return back()->with('success', 'User deleted.');
    }
}
