import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const Terms: React.FC = () => (
  <StaticPageLayout title="Terms of Service">
    <h3 className="font-bold text-xl">1. Agreement to Terms</h3>
    <p>
      By using the StatusPulse software and any associated documentation files (the “Software”), you agree to be bound by these Terms of Service.
      This Software is a product of Conzex Global Private Limited.
    </p>

    <h3 className="font-bold text-xl mt-6">2. License Grant</h3>
    <p>
      Subject to your compliance with these Terms, Conzex Global Private Limited grants you a limited, non-exclusive, non-transferable,
      non-sublicensable license to use the Software for your internal business purposes, according to the terms of your specific license agreement or subscription plan.
    </p>

    <h3 className="font-bold text-xl mt-6">3. Restrictions</h3>
    <p>
      You may not, without our prior written consent:
    </p>
    <ul>
      <li>Copy, modify, or create derivative works of the Software.</li>
      <li>Distribute, sublicense, rent, lease, or lend the Software to any third party.</li>
      <li>Reverse engineer, decompile, or disassemble the Software.</li>
      <li>Remove, alter, or obscure any proprietary notices on the Software.</li>
    </ul>

    <h3 className="font-bold text-xl mt-6">4. Disclaimer of Warranty</h3>
    <p>
      THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
      FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
      WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    </p>

    <h3 className="font-bold text-xl mt-6">5. Limitation of Liability</h3>
    <p>
      In no event shall Conzex Global Private Limited be liable for any special, incidental, indirect, or consequential damages whatsoever
      arising out of or in any way related to the use of or inability to use the Software.
    </p>
  </StaticPageLayout>
);

export default Terms;