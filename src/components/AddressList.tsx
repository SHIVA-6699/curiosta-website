import user from "@api/user";
import Button from "@components/Button";
import Typography from "@components/Typography";
import { useSignal } from "@preact/signals";
import { ChangeEvent, useEffect } from "preact/compat";
import AddressForm from "@components/AddressForm";
import { cx } from "class-variance-authority";
import AddressCard from "./AddressCard";
import { updateCart } from "@api/cart/updateCart";
import useLocalStorage from "@hooks/useLocalStorage";
import "@utils/addressList.css";
import { removeShippingAddress } from "@api/user/removeShippingAddress";

const AddressList = () => {
  const currentCustomer = user.customer.value;
  const selectedAddressId = useSignal<string | null>(null);
  const isNewAddress = useSignal<boolean>(true);
  const isLoading = useSignal<boolean>(false);

  const { get } = useLocalStorage();
  const localCartId = get("cartId");

  const handleSelectAddress = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.currentTarget;
    if (checked) {
      selectedAddressId.value = value;
    }
    isNewAddress.value = false;
  };

  // update shipping address
  const updateShippingAddress = async () => {
    try {
      if (selectedAddressId.value === currentCustomer?.billing_address_id) return;
      if (!localCartId || !selectedAddressId.value) return;

      isLoading.value = true;

      await updateCart({
        cartId: localCartId,
        shipping_address: selectedAddressId.value,
        billing_address: selectedAddressId.value,
      });
      await user.updateUser({ billing_address: selectedAddressId.value })
    } catch (error) {
    } finally {
      isLoading.value = false;
    }
  };

  useEffect(() => {
    updateShippingAddress();
  }, [selectedAddressId.value]);

  useEffect(() => {
    if (currentCustomer?.billing_address_id && !selectedAddressId.value) {
      selectedAddressId.value = currentCustomer.billing_address_id;
      isNewAddress.value = false;
    }
  }, [currentCustomer]);

  // address mutations

  const deleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await removeShippingAddress(id);
      if (currentCustomer?.billing_address_id === id) {
        await user.updateUser({ billing_address: undefined })
      }
    }
  }

  return (
    <div>
      <Typography
        tag="h5"
        size="h5/medium"
        variant="primary"
        id="summary-heading"
        className="mt-4"
      >
        Shipping Address
      </Typography>
      <div>
        <Typography size="body1/semi-bold" className="leading-6 hidden md:block mt-2">
          Select Shipping Address
        </Typography>
        <div class="address-container md:overflow-x-auto flex justify-center md:justify-normal p-2">
          <div class="my-4 grid grid-cols-1 sm:grid-cols-2 md:flex gap-4">
            <Button
              type="button"
              variant="icon"
              title="add new address"
              onClick={() => {
                isNewAddress.value = true;
                selectedAddressId.value = null;
              }}
              className={`flex justify-center w-52 min-h-[10rem] items-center bg-white shadow-sm rounded-lg border ${isNewAddress.value
                ? " border-indigo-600 ring-2 ring-indigo-600"
                : ""
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class={cx(
                  "w-10",
                  isNewAddress.value ? "stroke-indigo-600" : "stroke-gray-200"
                )}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Button>

            {currentCustomer?.shipping_addresses?.map((address) => (
              <AddressCard
                address={address}
                isLoading={isLoading}
                selectedAddressId={selectedAddressId}
                handleSelectAddress={handleSelectAddress}
                deleteAddress={deleteAddress}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        class={`${isNewAddress.value || selectedAddressId.value === null
          ? "block"
          : "hidden"
          }`}
      >
        <AddressForm selectedAddressId={selectedAddressId} isNewAddress={isNewAddress} />
      </div>
    </div>
  );
};

export default AddressList;
