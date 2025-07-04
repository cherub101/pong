import {useEffect, useState} from "react";

export default function LandingPage ({ onLogin }){
    const [create, setCreate] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token){
            fetch('https://backend-pong.konradito.win/verify', {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(async response => {
                if (response.status === 200) {
                    const data = await response.json();
                    localStorage.setItem('username', data.name)
                    onLogin();
                }
                else {
                    localStorage.removeItem('token');
                }
            })
            .catch(() => localStorage.removeItem('token'));
        }
    }, []);

    const register = async (event) => {
        event.preventDefault();
        if (event.target.password.value === event.target.retypedPassword.value){
            const credentials = {
                username: event.target.username.value,
                password: event.target.password.value
            };
            try{
                const response = await fetch ('https://backend-pong.konradito.win/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(credentials)
                });
                if(response.status === 201){
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', credentials.username);
                    console.log('User created');
                    onLogin();
                }
                else{
                    const data = await response.json();
                    console.error('Error:', data.message || data.error);
                    alert('Error:', data.message || data.error);
                }
            }
            catch (error) {
                console.error('Connection error:', error);
                alert('Connection error:', error)
            }
        }
        else{
            alert('Passwords didnt match');
        }
    }

    const logIn = async (event) => {
        event.preventDefault();
        const credentials = {
            username: event.target.username.value,
            password: event.target.password.value
        };
        try{
            const response = await fetch ('https://backend-pong.konradito.win/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            if(response.status === 200){
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', credentials.username);
                console.log('User logged');
                onLogin();
            }
            else{
                const data = await response.json();
                console.error('Error:', data.message || data.error);
                alert('Error:', data.message || data.error);
            }
        }
        catch (error) {
            console.error('Connection error:', error);
            alert('Connection error:', error);
        }
    }

    return (
        <div className='menuBox'>
            {!create ? (
                <>
                    Landing Page
                    <form onSubmit={logIn}>
                        <div className='flex flex-row'>
                            <div className='flex flex-col'>
                                <input
                                    type="text"
                                    name='username'
                                    className='inputData'
                                    placeholder="Enter username"
                                    required
                                />
                                <input
                                    type="password"
                                    name='password'
                                    className='inputData'
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                            <button
                                className='text-3xl'
                                type='submit'
                            >
                                Log in
                            </button>
                        </div>
                    </form>
                    <button
                        className='text-2xl'
                        onClick={() => setCreate(true)}
                    >
                        Or create new Account
                    </button>
                </>
            ) : (
                <>
                    Create new account
                    <form onSubmit={register}>
                        <div className='flex flex-row'>
                            <div className='flex flex-col'>
                                <input
                                    type="text"
                                    name='username'
                                    className='inputData'
                                    placeholder="Enter username"
                                    required
                                />
                                <input
                                    type="password"
                                    name='password'
                                    className='inputData'
                                    placeholder="Enter password"
                                    required
                                />
                                <input
                                    type="password"
                                    name='retypedPassword'
                                    className='inputData'
                                    placeholder="Enter password again"
                                    required
                                />
                            </div>
                            <button
                                className='text-3xl'
                                type='submit'
                            >
                                Create
                            </button>
                        </div>
                    </form>
                    <button
                        className='text-2xl'
                        onClick={() => setCreate(false)}
                    >
                        Or log in to existing account
                    </button>
                </>
            )}
        </div>
    )
}