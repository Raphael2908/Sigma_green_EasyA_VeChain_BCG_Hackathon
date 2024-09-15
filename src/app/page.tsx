'use client';

import { createClient } from '@/app/utils/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from "@vechain/dapp-kit-react";
import Swal from 'sweetalert2';

const supabase = createClient();

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet(); // Get the connected wallet account

  // Function to join an event
  const handleJoinEvent = async (eventId: string) => {
    if (!account) {
      Swal.fire({
        title: 'Wallet Required',
        text: 'You need to connect your wallet to join this event!',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Show SweetAlert form to collect participant details
    const { value: formValues } = await Swal.fire({
      title: 'Join Event',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Name">
        <input id="swal-input2" class="swal2-input" placeholder="Contact Number">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const contactNumber = (document.getElementById('swal-input2') as HTMLInputElement).value;

        if (!name || !contactNumber) {
          Swal.showValidationMessage('Please enter both name and contact number');
        }

        return { name, contactNumber };
      },
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      cancelButtonColor: '#d33',
    });

    if (!formValues) return;

    const { name, contactNumber } = formValues;

    // Check if the participant already exists
    try {
      const { data: existingParticipant, error: findError } = await supabase
        .from('participants')
        .select('*')
        .eq('wallet_address', account)
        .eq('event_id', eventId);
      
      if (findError) {
        console.error('Error checking participant:', findError);
        Swal.fire({
          title: 'Error',
          text: 'Error checking participant status.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      if (existingParticipant.length > 0) {
        Swal.fire({
          title: 'Already Joined',
          text: 'You have already joined this event.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
        return;
      }

      // Create a new participant with 'pending' status
      const { error: insertError } = await supabase
        .from('participants')
        .insert([
          {
            name,
            contact_number: contactNumber,
            wallet_address: account,
            status: 'pending',
            event_id: eventId,
          },
        ]);

      if (insertError) {
        console.error('Error creating participant:', insertError);
        Swal.fire({
          title: 'Error',
          text: `There was a problem joining the event: ${insertError.message}`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Success',
          text: 'You have been added to the event with a status of pending.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while trying to join the event.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`id, activity, date, participant_strength, organisation_name, description, gaurantor, gaurantor_contact, status, 
          participants(name, contact_number, wallet_address)
        `);

      if (error) {
        setError(error.message);
      } else {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [account]);

  if (loading) return <p className='text-center text-gray-600'>Loading...</p>;
  if (error) return <p className='text-center text-red-600'>Error: {error}</p>;

  return (
    <div >
      <h1 className='text-3xl font-bold mb-6'>Events</h1>
      {events.length > 0 ? (
        <div className='space-x-6 flex'>
          {events.map((event) => (
            <div key={event.id} className='p-6 bg-white shadow-lg rounded-lg'>
              <h2 className='text-2xl font-semibold mb-2'>{event.activity}</h2>
              <p className='text-gray-700 mb-1'>Date: {new Date(event.date).toLocaleString()}</p>
              <p className='text-gray-700 mb-1'>Organisation: {event.organisation_name}</p>
              <p className='text-gray-700 mb-1'>Description: {event.description}</p>
              <p className='text-gray-700 mb-1'>Gaurantor: {event.gaurantor}</p>
              <p className='text-gray-700 mb-1'>Contact: {event.gaurantor_contact}</p>
              <p className='text-gray-700 mb-4'>Status: 
                {event.status == 'approved' ? 
                  <p className='text-green-500'>approved</p>  : null
                }
                {event.status == 'disapproved' ? 
                  <p className='text-red-500'>disapproved</p>  : null
                }
                {event.status == 'pending' ? 
                  <p className='text-orange-500'>pending</p>  : null
                }
              </p>
              {event.status == 'approved' ? <button
                className='bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500'
                onClick={() => handleJoinEvent(event.id)}
                >
                Join Event
                </button> :
              
                <button
                disabled
                className='bg-gray-500 text-white px-4 py-2 rounded-lg cursor-not-allowed focus:outline-none focus:ring-2 '
                >
                  Join Event
                </button>
              }
              {/* Display Participants for the Event */}
              <h3 className='text-xl font-semibold mt-6 mb-2'>Participants:</h3>
              {event.participants && event.participants.length > 0 ? (
                <ul className='space-y-4'>
                  {event.participants.map((participant: any) => (
                    <li key={participant.wallet_address} className='p-4 bg-gray-100 border border-gray-300 rounded-lg'>
                      <p className='font-semibold'>Name: {participant.name}</p>
                      <p>Contact Number: {participant.contact_number}</p>
                      <p>Wallet Address: {participant.wallet_address}</p>
                      <p>Status: {participant.status}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No participants yet.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className='text-center text-gray-600'>No events found.</p>
      )}
    </div>
  );
}
