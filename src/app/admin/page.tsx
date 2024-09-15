'use client';

import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useConnex, useWallet } from '@vechain/dapp-kit-react';
import { clauseBuilder, unitsUtils } from '@vechain/sdk-core';

const supabase = createClient();

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { account } = useWallet()
  const connex = useConnex()
  const [txId, setTxId] = useState<string>('')



  
  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*, participants(*)'); // Fetch all fields or specific ones if needed

      if (error) {
        setError(error.message);
      } else {
        setEvents(data);
      }
      setLoading(false);
    };
    
    fetchEvents();
  }, []);

  // Handle event approval
  const handleApproveEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'approved' }) // Update the status to 'approved'
        .eq('id', eventId);

      if (error) {
        console.error('Error updating event status:', error);
        Swal.fire({
          title: 'Error',
          text: `There was a problem approving the event: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Success',
          text: 'Event approved successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        // Refresh the events list
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, status: 'approved' } : event
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while trying to approve the event.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // Handle event rejection
  const handleRejectEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'disapproved' }) // Update the status to 'disapprove'
        .eq('id', eventId);

      if (error) {
        console.error('Error updating event status:', error);
        Swal.fire({
          title: 'Error',
          text: `There was a problem rejecting the event: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          title: 'Success',
          text: 'Event disapprove successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        // Refresh the events list
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, status: 'disapproved' } : event
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while trying to reject the event.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handlePayout = async (participants: any, eventId: string) => {
    const clauses: Array<any> = []
    participants.map((participant: any) => {
      clauses.push({
        ...(
          clauseBuilder.transferVET(participant.wallet_address, unitsUtils.parseVET('100'))
        ), 
      })
    })
    console.log(clauses)

    const tx = connex.vendor.sign('tx', clauses)

                // requesting a specific signer will prevent the user from changing the signer to another wallet than the signed in one, preventing confusion
                .signer(account)

            // ask the user to sign the transaction
    const { txid } = await tx.request()

    // the resulting transaction id is stored to check for its status later
    setTxId(txid)
    const error = await supabase.from('events').update({status: 'paid'}).eq('id', eventId);
    console.log(error)
  }

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-center text-gray-800'>Admin - Events</h1>
      <Link href='/' className='text-blue-500 hover:underline mb-4 block'>
                &larr; Back to Home
      </Link>
      {events.length > 0 ? (
        <ul className='space-y-4'>
          {events.toReversed().map((event) => (
            <li key={event.id} className='bg-white shadow-md rounded-lg p-6'>
              <h2 className='text-2xl font-semibold'>{event.activity}</h2>
              <p className='text-gray-600'>Date: {new Date(event.date).toLocaleString()}</p>
              <p className='text-gray-600'>Organisation: {event.organisation_name}</p>
              <p className='text-gray-600'>Description: {event.description}</p>
              <p className='text-gray-600'>Gaurantor: {event.gaurantor}</p>
              <p className='text-gray-600'>Contact: {event.gaurantor_contact}</p>
              <p className={`text-lg font-medium ${event.status === 'approved' || event.status === 'paid' ? 'text-green-500' : event.status === 'disapproved' ? 'text-red-500' : 'text-yellow-500'}`}>
                Status: {event.status}
              </p>
              {event.status == 'pending' && (
                <div className='flex space-x-4 mt-4'>
                  <button
                    onClick={() => handleApproveEvent(event.id)}
                    className='px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition'
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectEvent(event.id)}
                    className='px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition'
                  >
                    Reject
                  </button>
                </div>
              )}
                {event.status == 'approved' && (
                    <button onClick={() => handlePayout(event.participants, event.id)} 
                    className='px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition'>
                        Pay out
                    </button>
                )}
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-center text-gray-500'>No events found.</p>
      )}
    </div>
  );
}

