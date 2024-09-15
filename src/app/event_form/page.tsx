'use client';
import { useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateEvents() {
    const router = useRouter();

    interface EventForm {
        activity: string;
        date: string;
        participant_strength: number;
        organisation_name: string;
        description: string;
        gaurantor: string;
        gaurantor_contact: string;
    }

    const [eventForm, setEventForm] = useState<EventForm>({
        activity: '',
        date: '',
        participant_strength: 0,
        organisation_name: '',
        description: '',
        gaurantor: '',
        gaurantor_contact: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("submit");
        const supabase = createClient();

        try {
            const response = await supabase.from('events').insert(eventForm);
            console.log(response);
            router.push('/');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div className='  p-6 bg-white shadow-md rounded-lg'>
            <Link href='/' className='text-blue-500 hover:underline mb-4 block'>
                &larr; Back to Home
            </Link>
            <h1 className='text-2xl font-bold mb-6'>Create Event</h1>
            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label htmlFor="activity" className='block text-gray-700 font-semibold mb-1'>Activity</label>
                    <input
                        type="text"
                        id="activity"
                        name="activity"
                        placeholder="Enter event activity"
                        value={eventForm.activity}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <div>
                    <label htmlFor="date" className='block text-gray-700 font-semibold mb-1'>Date</label>
                    <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={eventForm.date}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <div>
                    <label htmlFor="participant_strength" className='block text-gray-700 font-semibold mb-1'>Participant Strength</label>
                    <input
                        type="number"
                        id="participant_strength"
                        name="participant_strength"
                        placeholder="Enter participant strength"
                        value={eventForm.participant_strength}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <div>
                    <label htmlFor="organisation_name" className='block text-gray-700 font-semibold mb-1'>Organisation Name</label>
                    <input
                        type="text"
                        id="organisation_name"
                        name="organisation_name"
                        placeholder="Enter organisation name"
                        value={eventForm.organisation_name}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <div>
                    <label htmlFor="description" className='block text-gray-700 font-semibold mb-1'>Description</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Enter event description"
                        value={eventForm.description}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <div>
                    <label htmlFor="gaurantor" className='block text-gray-700 font-semibold mb-1'>Gaurantor</label>
                    <input
                        type="text"
                        id="gaurantor"
                        name="gaurantor"
                        placeholder="Enter gaurantor's name"
                        value={eventForm.gaurantor}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <div>
                    <label htmlFor="gaurantor_contact" className='block text-gray-700 font-semibold mb-1'>Gaurantor Contact</label>
                    <input
                        type="text"
                        id="gaurantor_contact"
                        name="gaurantor_contact"
                        placeholder="Enter gaurantor's contact number"
                        value={eventForm.gaurantor_contact}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <button type="submit" className='bg-purple-500 text-white px-4 py-2 w-full rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500'>
                    Submit
                </button>
            </form>
        </div>
    );
}
