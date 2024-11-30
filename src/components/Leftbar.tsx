import React, { useState } from 'react';

export const LeftBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative h-screen sticky top-0 mr-4">
            <button
                onClick={toggleSidebar}
                className="sm:hidden p-2 fixed top-4 left-4 z-50 bg-gray-800 text-white rounded-lg mt-3"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 6h15M4.5 12h15M4.5 18h15"
                    />
                </svg>
            </button>
            <div
                className={`fixed top-0 left-0 z-40 w-64 h-full bg-black text-white transition-transform transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0 sm:relative sm:flex-col`}
            >
                <div className="flex-grow mb-5">
                    <div className="space-y-2">
                        {/* Postings */}
                        <div className="flex items-center p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-300"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 12l9-9 9 9M4.5 10.5L12 3l7.5 7.5"
                                />
                            </svg>
                            <a
                                href="/postings"
                                className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                            >
                                Postings
                            </a>
                        </div>
                        {/* Add a Post */}
                        <div className="flex items-center p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-300"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8V4m0 0H4m8 0h8M12 4v4m0 4v8m-4-4h8"
                                />
                            </svg>
                            <a
                                href="./addAPost"
                                className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                            >
                                Add a post
                            </a>
                        </div>
                        {/* Your Postings */}
                        <div className="flex items-center p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-300"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5.25 5.25h13.5v13.5H5.25z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 9h6v6H9z"
                                />
                            </svg>
                            <a
                                href="./yourPostings"
                                className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                            >
                                Your Postings
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 z-30 bg-black opacity-50 sm:hidden"
                ></div>
            )}
        </div>
    );
};
