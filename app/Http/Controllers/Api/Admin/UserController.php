<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return UserResource::collection(User::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:user,admin',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return new UserResource($user);
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}
